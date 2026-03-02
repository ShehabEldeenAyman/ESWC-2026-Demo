import React, { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';

export const SQLChart = ({ URL, title }) => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  // Track if the first request has ever been made
  const [hasStarted, setHasStarted] = useState(false); 
  const limit = 100;

  const fetchData = async (targetPage) => {
    setLoading(true);
    setHasStarted(true); // Mark that we've initiated a fetch
    try {
      const response = await fetch(`${URL}?page=${targetPage}&limit=${limit}`);
      if (!response.ok) throw new Error('Network response was not ok');
      
      const json = await response.json();
      const newPoints = json.data || [];

      if (newPoints.length < limit) {
        setHasMore(false);
      }

      setData(prevData => {
        const combined = [...prevData, ...newPoints];
        return combined.sort((a, b) => new Date(a.time) - new Date(b.time));
      });
      
      setError(null);
    } catch (err) {
      setError(`Failed to load SQL data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Removed the useEffect that called fetchData(1) on mount

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchData(nextPage);
  };

  const handleReset = () => {
    setData([]);
    setPage(1);
    setHasMore(true);
    setHasStarted(false); // Reset to "unloaded" state
  };

  const getOption = () => ({
    title: {
      text: title || 'River Monitoring (SQL/Postgres)',
      left: 'center',
      textStyle: { fontSize: 16, color: '#333' }
    },
    tooltip: { 
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    grid: { bottom: '15%', containLabel: true },
    dataZoom: [
      { type: 'slider', start: 0, end: 100 },
      { type: 'inside' }
    ],
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: data.map(item => new Date(item.time).toLocaleString()),
    },
    yAxis: {
      type: 'value',
      scale: true,
      name: 'Stage (m)'
    },
    series: [
      {
        name: 'SQL Observation',
        type: 'line',
        symbol: 'none',
        sampling: 'lttb',
        large: true,
        itemStyle: { color: '#8e44ad' },
        areaStyle: {
            color: {
              type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(142, 68, 173, 0.3)' },
                { offset: 1, color: 'rgba(142, 68, 173, 0)' }
              ]
            }
        },
        data: data.map(item => parseFloat(item.val))
      }
    ]
  });

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#fff', padding: '10px', borderRadius: '8px', boxSizing: 'border-box' }}>
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
      
      <div style={{ flexGrow: 1, minHeight: '350px', position: 'relative' }}>
        {/* Visual placeholder when no data is loaded */}
        {!hasStarted && !loading && (
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', zIndex: 1 }}>
            <p style={{ color: '#666', marginBottom: '15px' }}>Data will appear here once loaded.</p>
            <button onClick={() => fetchData(1)} style={buttonStyle}>Fetch SQL Data</button>
          </div>
        )}

        <ReactECharts 
          option={getOption()} 
          style={{ height: '100%', width: '100%', opacity: hasStarted ? 1 : 0.2 }} 
          notMerge={true} 
        />
      </div>

      {hasStarted && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginTop: '10px' }}>
          <span style={{ fontSize: '0.9rem', color: '#666' }}>Records: <strong>{data.length}</strong></span>
          <button 
            onClick={loadMore} 
            disabled={loading || !hasMore}
            style={{
              ...buttonStyle,
              opacity: (loading || !hasMore) ? 0.5 : 1,
              cursor: (loading || !hasMore) ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Querying...' : hasMore ? 'Load Next 100 Rows' : 'End of Database'}
          </button>
          <button 
            onClick={handleReset}
            style={{ ...buttonStyle, backgroundColor: '#6c757d' }}
          >
            Reset
          </button>
        </div>
      )}
    </div>
  );
};

const buttonStyle = {
  padding: '8px 16px',
  backgroundColor: '#8e44ad',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  fontWeight: '600'
};