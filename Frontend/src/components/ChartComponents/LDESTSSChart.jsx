import React, { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';

export const LDESTSSChart = ({ URL, title }) => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  // Track if the user has triggered the first load
  const [hasStarted, setHasStarted] = useState(false); 
  const limit = 10; // Snippets per page

  const fetchData = async (targetPage) => {
    setLoading(true);
    setHasStarted(true); // Ensure the chart UI knows we've started
    try {
      const response = await fetch(`${URL}?page=${targetPage}&limit=${limit}`);
      if (!response.ok) throw new Error('Network response was not ok');
      
      const snippets = await response.json();
      
      if (snippets.length < limit) {
        setHasMore(false);
      }

      // Flatten the nested "points" arrays from each snippet
      const newPoints = snippets.flatMap(snippet => snippet.points || []);

      setData(prevData => {
        const combined = [...prevData, ...newPoints];
        // Sort by time to ensure a continuous line
        return combined.sort((a, b) => new Date(a.time) - new Date(b.time));
      });
      
      setError(null);
    } catch (err) {
      setError(`Failed to load TSS data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // REMOVED: The useEffect that previously automatically called fetchData(1) on mount

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchData(nextPage);
  };

  const startInitialLoad = () => {
    setPage(1);
    fetchData(1);
  };

  const getOption = () => ({
    title: {
      text: title || 'River Monitoring (LDESTSS)',
      left: 'center',
      textStyle: { fontSize: 16, color: '#333' }
    },
    tooltip: { trigger: 'axis' },
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
      name: 'Value'
    },
    series: [
      {
        name: 'Observation',
        type: 'line',
        symbol: 'none',
        sampling: 'lttb',
        large: true,
        itemStyle: { color: '#e67e22' },
        data: data.map(item => parseFloat(item.value))
      }
    ]
  });

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#fff', padding: '10px' }}>
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
      
      <div style={{ flexGrow: 1, minHeight: '350px', position: 'relative' }}>
        {/* Visual cue to the user when data is not yet loaded */}
        {!hasStarted && !loading && (
          <div style={overlayStyle}>
            <p style={{ marginBottom: '15px', color: '#666' }}>LDESTSS data is ready to be queried.</p>
            <button onClick={startInitialLoad} style={buttonStyle}>Fetch First Snippets</button>
          </div>
        )}

        <ReactECharts 
          option={getOption()} 
          style={{ height: '100%', width: '100%' }} 
          notMerge={true}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginTop: '10px' }}>
        <span style={{ fontSize: '0.9rem' }}>Points: <strong>{data.length}</strong></span>
        
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
            {loading ? 'Loading...' : hasMore ? 'Load More Snippets' : 'End of Data'}
          </button>
        ) : (
          <button onClick={startInitialLoad} disabled={loading} style={buttonStyle}>
            {loading ? 'Connecting...' : 'Initial Load'}
          </button>
        )}

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
  backgroundColor: 'rgba(255,255,255,0.9)',
  zIndex: 10,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: '8px'
};

const buttonStyle = {
  padding: '8px 16px',
  backgroundColor: '#e67e22',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontWeight: '600'
};

export default LDESTSSChart;