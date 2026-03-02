import React, { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';

// Configuration for each data type
const CHART_CONFIGS = {
  LDES: {
    color: '#1523e0',
    limit: 100,
    extract: (json) => json,
    valueKey: 'value',
    label: 'LDES'
  },
  LDESTSS: {
    color: '#e67e22',
    limit: 10,
    extract: (json) => json.flatMap(snippet => snippet.points || []),
    valueKey: 'value',
    label: 'Snippets'
  },
  SQL: {
    color: '#8e44ad',
    limit: 100,
    extract: (json) => json.data || [],
    valueKey: 'val',
    label: 'SQL Rows'
  },
  TTL: {
    color: '#27ae60',
    limit: 100,
    extract: (json) => json,
    valueKey: 'value',
    precision: 3,
    label: 'TTL Points'
  }
};

export const MasterChart = ({ URL, title, type = 'LDES' }) => {
  const config = CHART_CONFIGS[type] || CHART_CONFIGS.LDES;
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchData = async (targetPage, isReset = false) => {
    setLoading(true);
    try {
      const response = await fetch(`${URL}?page=${targetPage}&limit=${config.limit}`);
      const json = await response.json();
      const newPoints = config.extract(json);

      if (newPoints.length < config.limit && type !== 'LDESTSS') {
        setHasMore(false);
      }

      setData(prev => {
        const combined = isReset ? newPoints : [...prev, ...newPoints];
        return combined.sort((a, b) => new Date(a.time) - new Date(b.time));
      });
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(1, true); }, [URL, type]);

  const getOption = () => ({
    title: { text: title, left: 'center' },
    tooltip: { 
      trigger: 'axis',
      formatter: config.precision ? (params) => {
        const item = params[0];
        return `${item.name}<br/>Value: <b>${parseFloat(item.value).toFixed(config.precision)}</b>`;
      } : undefined
    },
    dataZoom: [{ type: 'slider' }, { type: 'inside' }],
    xAxis: { 
      type: 'category', 
      data: data.map(item => new Date(item.time).toLocaleString()) 
    },
    yAxis: { type: 'value', scale: true },
    series: [{
      type: 'line',
      sampling: 'lttb',
      itemStyle: { color: config.color },
      areaStyle: {
        color: {
          type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: `${config.color}4D` }, // 30% opacity
            { offset: 1, color: `${config.color}00` }
          ]
        }
      },
      data: data.map(item => parseFloat(item[config.valueKey]))
    }]
  });

  return (
    <div style={{ padding: '10px', background: '#fff', borderRadius: '8px' }}>
      <ReactECharts option={getOption()} style={{ height: '400px' }} notMerge={true} />
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '10px' }}>
        <span>{config.label}: <b>{data.length}</b></span>
        <button 
          onClick={() => { setPage(p => p + 1); fetchData(page + 1); }}
          disabled={loading || !hasMore}
          style={{ backgroundColor: config.color, color: '#white', border: 'none', padding: '8px 16px', borderRadius: '4px' }}
        >
          {loading ? 'Loading...' : 'Load More'}
        </button>
      </div>
    </div>
  );
};