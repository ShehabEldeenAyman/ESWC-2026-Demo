import React, { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';

export const LDESChart = ({URL,title}) => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  // New state to track if the very first load has been triggered
  const [hasStarted, setHasStarted] = useState(false); 
  const limit = 100;

  const fetchData = async (targetPage) => {
    setLoading(true);
    setHasStarted(true); // Mark that we have started interacting with the data
    try {
      const response = await fetch(`${URL}?page=${targetPage}&limit=${limit}`);
      if (!response.ok) throw new Error('Network response was not ok');
      
      const json = await response.json();
      
      if (json.length < limit) {
        setHasMore(false);
      }

      setData(prevData => {
        const combined = [...prevData, ...json];
        return combined.sort((a, b) => new Date(a.time) - new Date(b.time));
      });
      
      setError(null);
    } catch (err) {
      setError(`Failed to load data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // REMOVED: The useEffect that previously called fetchData(1) on mount

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchData(nextPage);
  };

  const startInitialLoad = () => {
    setPage(1);
    fetchData(1);
  };

  const getOption = () => {
    return {
      title: {
        text: title || 'ERROR: No Title Provided',
        left: 'center',
        textStyle: { fontSize: 16, color: '#333' }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' }
      },
      toolbox: {
        feature: {
          dataZoom: { yAxisIndex: 'none' },
          restore: {},
          saveAsImage: {}
        }
      },
      grid: {
        left: '5%',
        right: '5%',
        bottom: '15%',
        containLabel: true
      },
      dataZoom: [
        {
          type: 'slider',
          start: 0,
          end: 100,
          handleSize: '80%',
          handleStyle: {
            color: '#fff',
            shadowBlur: 3,
            shadowColor: 'rgba(0, 0, 0, 0.6)',
            shadowOffsetX: 2,
            shadowOffsetY: 2
          }
        },
        {
          type: 'inside'
        }
      ],
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: data.map(item => new Date(item.time).toLocaleString()),
        axisLabel: { fontSize: 10 }
      },
      yAxis: {
        type: 'value',
        name: 'Stage (m)',
        scale: true,
        splitLine: { show: true, lineStyle: { type: 'dashed' } }
      },
      series: [
        {
          name: 'River Stage',
          type: 'line',
          symbol: 'none',
          sampling: 'lttb',
          large: true,
          itemStyle: { color: '#1523e0' },
          areaStyle: {
            color: {
              type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(21, 35, 224, 0.3)' },
                { offset: 1, color: 'rgba(21, 35, 224, 0)' }
              ]
            }
          },
          data: data.map(item => parseFloat(item.value))
        }
      ]
    };
  };

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: '8px', padding: '10px', boxSizing: 'border-box' }}>
      
      {error && <div style={{ color: '#721c24', backgroundColor: '#f8d7da', padding: '10px', borderRadius: '4px', marginBottom: '10px' }}>{error}</div>}
      
      <div style={{ flexGrow: 1, minHeight: '350px', position: 'relative' }}>
        {/* Placeholder UI when no data is loaded yet */}
        {!hasStarted && !loading && (
          <div style={overlayStyle}>
            <p>Data is not loaded yet.</p>
            <button onClick={startInitialLoad} style={buttonStyle}>Click to Load Data</button>
          </div>
        )}
        
        <ReactECharts 
          option={getOption()} 
          style={{ height: '100%', width: '100%' }} 
          notMerge={true} 
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginTop: '10px' }}>
        <div style={{ fontSize: '0.9rem', color: '#666' }}>
            Showing <strong>{data.length}</strong> observations
        </div>
        
        {hasStarted ? (
          <button 
            onClick={loadMore} 
            disabled={loading || !hasMore}
            style={{
              ...buttonStyle,
              opacity: (loading || !hasMore) ? 0.5 : 1,
              cursor: (loading || !hasMore) ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Fetching...' : hasMore ? 'Load Next 100 Points' : 'End of Records'}
          </button>
        ) : (
          <button onClick={startInitialLoad} disabled={loading} style={buttonStyle}>
            {loading ? 'Fetching...' : 'Initial Load'}
          </button>
        )
        }

        <button 
          onClick={() => { setData([]); setPage(1); setHasMore(true); setHasStarted(false); }}
          style={{ ...buttonStyle, backgroundColor: '#6c757d' }}
        >
          Reset
        </button>
      </div>
    </div>
  );
};

const overlayStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(255,255,255,0.8)',
  zIndex: 10,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center'
};

const buttonStyle = {
  padding: '10px 20px',
  backgroundColor: '#002353',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  fontWeight: '600',
  transition: 'background 0.2s'
};