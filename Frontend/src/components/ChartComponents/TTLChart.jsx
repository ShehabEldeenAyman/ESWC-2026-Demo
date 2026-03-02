import React, { useState } from 'react';
import ReactECharts from 'echarts-for-react';

export const TTLChart = ({ URL, title }) => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [hasStarted, setHasStarted] = useState(false); // New state to track initialization
  const limit = 100;

  const fetchData = async (targetPage) => {
    setLoading(true);
    setHasStarted(true); // Mark that loading has been triggered
    try {
      const response = await fetch(`${URL}?page=${targetPage}&limit=${limit}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const json = await response.json();
      if (json.length < limit) setHasMore(false);

      setData(prevData => {
        const combined = [...prevData, ...json];
        return combined.sort((a, b) => new Date(a.time) - new Date(b.time));
      });
      setError(null);
    } catch (err) {
      setError(`Failed to load TTL data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // useEffect for fetchData(1) removed to prevent auto-load

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchData(nextPage);
  };

  const startInitialLoad = () => fetchData(1); // Helper for the first click

  const getOption = () => ({
    title: {
      text: title || 'River Monitoring (TTL)',
      left: 'center',
      textStyle: { fontSize: 16, color: '#333' }
    },
    tooltip: { 
      trigger: 'axis',
      formatter: (params) => {
        const item = params[0];
        return `${item.name}<br/>Value: <b>${parseFloat(item.value).toFixed(3)}</b>`;
      }
    },
    toolbox: { feature: { dataZoom: { yAxisIndex: 'none' }, restore: {}, saveAsImage: {} } },
    dataZoom: [{ type: 'slider', start: 0, end: 100 }, { type: 'inside' }],
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: data.map(item => new Date(item.time).toLocaleString()),
      axisLabel: { fontSize: 10 }
    },
    yAxis: { type: 'value', scale: true, name: 'Stage (m)', splitLine: { show: true, lineStyle: { type: 'dashed' } } },
    series: [{
      name: 'Observation',
      type: 'line',
      symbol: 'none',
      sampling: 'lttb',
      large: true,
      itemStyle: { color: '#27ae60' },
      areaStyle: {
        color: {
          type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [{ offset: 0, color: 'rgba(39, 174, 96, 0.3)' }, { offset: 1, color: 'rgba(39, 174, 96, 0)' }]
        }
      },
      data: data.map(item => parseFloat(item.value))
    }]
  });

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#fff', padding: '10px', borderRadius: '8px', boxSizing: 'border-box' }}>
      {error && <div style={{ color: '#721c24', backgroundColor: '#f8d7da', padding: '10px', borderRadius: '4px' }}>{error}</div>}
      
      <div style={{ flexGrow: 1, minHeight: '350px', position: 'relative' }}>
        {/* Overlay displayed only before the first load */}
        {!hasStarted && !loading && (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.7)', zIndex: 10 }}>
            <button onClick={startInitialLoad} style={buttonStyle}>Click to Load TTL Data</button>
          </div>
        )}
        <ReactECharts option={getOption()} style={{ height: '100%', width: '100%' }} notMerge={true} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginTop: '10px' }}>
        <div style={{ fontSize: '0.9rem', color: '#666' }}>Loaded: <strong>{data.length}</strong> points</div>
        
        {hasStarted ? (
          <button onClick={loadMore} disabled={loading || !hasMore} style={{ ...buttonStyle, opacity: (loading || !hasMore) ? 0.5 : 1 }}>
            {loading ? 'Fetching...' : hasMore ? 'Load More Data' : 'All Data Loaded'}
          </button>
        ) : (
          <button onClick={startInitialLoad} style={buttonStyle}>Initial Load</button>
        )}

        <button onClick={() => { setData([]); setPage(1); setHasMore(true); setHasStarted(false); }} style={{ ...buttonStyle, backgroundColor: '#6c757d' }}>Reset</button>
      </div>
    </div>
  );
};

const buttonStyle = { padding: '8px 16px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '4px', fontWeight: '600', cursor: 'pointer' };