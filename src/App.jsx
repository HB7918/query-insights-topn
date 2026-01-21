import { useState, useMemo } from 'react'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import QueryList from './components/QueryList'
import './App.css'

function App() {
  const [topN] = useState(10)
  const [startDate, setStartDate] = useState(() => {
    const date = new Date()
    date.setHours(date.getHours() - 24)
    return date.toISOString().slice(0, 16)
  })
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().slice(0, 16)
  })
  const [selectedCell, setSelectedCell] = useState(null)
  const [showDrillDown, setShowDrillDown] = useState(false)
  const [avgMetric, setAvgMetric] = useState('latency')
  const [p90Metric, setP90Metric] = useState('latency')
  const [p99Metric, setP99Metric] = useState('latency')
  const [nodeViewMode, setNodeViewMode] = useState('chart')
  const [indexViewMode, setIndexViewMode] = useState('chart')
  const [performanceViewMode, setPerformanceViewMode] = useState('line')
  const [performanceMetric, setPerformanceMetric] = useState('latency')
  const [heatmapDimension, setHeatmapDimension] = useState('index')
  const [heatmapMetric, setHeatmapMetric] = useState('latency')
  const [hoveredCell, setHoveredCell] = useState(null)
  const [activeTab, setActiveTab] = useState('topN')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [queriesByDimension, setQueriesByDimension] = useState('node')
  
  // Query filter states
  const [searchValue, setSearchValue] = useState('')
  const [tokens, setTokens] = useState([])
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState('properties')
  const [selectedProperty, setSelectedProperty] = useState(null)
  const [selectedOperator, setSelectedOperator] = useState(null)
  const [valueInput, setValueInput] = useState('')

  // Handle refresh
  const handleRefresh = () => {
    setIsRefreshing(true)
    // Simulate data refresh
    setTimeout(() => {
      setIsRefreshing(false)
    }, 1000)
  }

  // Query filter properties and options
  const filteringProperties = [
    { key: 'type', propertyLabel: 'Type', type: 'enum' },
    { key: 'queryCount', propertyLabel: 'Query Count', type: 'number' },
    { key: 'timestamp', propertyLabel: 'Timestamp', type: 'date' },
    { key: 'latency', propertyLabel: 'Latency', type: 'number' },
    { key: 'cpuTime', propertyLabel: 'CPU Time', type: 'number' },
    { key: 'memoryUsage', propertyLabel: 'Memory Usage', type: 'number' },
    { key: 'indices', propertyLabel: 'Indices', type: 'enum' },
    { key: 'searchType', propertyLabel: 'Search Type', type: 'enum' },
    { key: 'coordinatorNode', propertyLabel: 'Coordinator Node', type: 'enum' },
    { key: 'totalShards', propertyLabel: 'Total Shards', type: 'number' },
  ]

  const filteringOptions = [
    { propertyKey: 'type', value: 'Group' },
    { propertyKey: 'type', value: 'Search' },
    { propertyKey: 'type', value: 'Aggregation' },
    { propertyKey: 'type', value: 'Match' },
    { propertyKey: 'searchType', value: 'DFS' },
    { propertyKey: 'searchType', value: 'Query Then Fetch' },
    { propertyKey: 'searchType', value: 'Query And Fetch' },
    { propertyKey: 'coordinatorNode', value: 'node1' },
    { propertyKey: 'coordinatorNode', value: 'node2' },
    { propertyKey: 'coordinatorNode', value: 'node3' },
    { propertyKey: 'indices', value: 'index1' },
    { propertyKey: 'indices', value: 'index2' },
    { propertyKey: 'indices', value: 'index3' },
  ]

  const operators = [
    { value: '=', label: 'Equals', symbol: '=', types: ['enum', 'number', 'date'] },
    { value: '!=', label: 'Does not equal', symbol: '!=', types: ['enum', 'number', 'date'] },
    { value: ':', label: 'Contains', symbol: ':', types: ['enum'] },
    { value: '!:', label: 'Does not contain', symbol: '!:', types: ['enum'] },
    { value: '^', label: 'Starts with', symbol: '^', types: ['enum'] },
    { value: '!^', label: 'Does not start with', symbol: '!^', types: ['enum'] },
    { value: '>', label: 'Greater than', symbol: '>', types: ['number', 'date'] },
    { value: '<', label: 'Less than', symbol: '<', types: ['number', 'date'] },
    { value: '>=', label: 'Greater than or equal', symbol: '>=', types: ['number', 'date'] },
    { value: '<=', label: 'Less than or equal', symbol: '<=', types: ['number', 'date'] },
  ]

  const handlePropertySelect = (property) => {
    setSelectedProperty(property)
    setCurrentStep('operators')
    setSearchValue('')
  }

  const handleOperatorSelect = (operator) => {
    setSelectedOperator(operator)
    setCurrentStep('values')
    setValueInput('')
  }

  const handleValueSelect = (value) => {
    const newToken = {
      property: selectedProperty,
      operator: selectedOperator,
      value: value
    }
    
    setTokens([...tokens, newToken])
    setSearchValue('')
    setCurrentStep('properties')
    setSelectedProperty(null)
    setSelectedOperator(null)
    setIsPopoverOpen(false)
  }

  const handleFreeTextValue = () => {
    if (valueInput.trim()) {
      const newToken = {
        property: selectedProperty,
        operator: selectedOperator,
        value: valueInput.trim()
      }
      
      setTokens([...tokens, newToken])
      setSearchValue('')
      setValueInput('')
      setCurrentStep('properties')
      setSelectedProperty(null)
      setSelectedOperator(null)
      setIsPopoverOpen(false)
    }
  }

  const handleRemoveToken = (index) => {
    const newTokens = tokens.filter((_, i) => i !== index)
    setTokens(newTokens)
  }

  const handleClearAll = () => {
    setTokens([])
    setSearchValue('')
    setIsPopoverOpen(false)
  }

  const getPropertyOptions = () => {
    return filteringProperties
      .filter(prop => 
        prop.propertyLabel.toLowerCase().includes(searchValue.toLowerCase())
      )
  }

  const getOperatorOptions = () => {
    return operators.filter(op => op.types.includes(selectedProperty?.type || 'enum'))
  }

  const getValueOptions = () => {
    if (!selectedProperty || selectedProperty.type !== 'enum') return []
    
    return filteringOptions
      .filter(opt => opt.propertyKey === selectedProperty.key)
  }

  // Format date for display
  const formatDateDisplay = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3,
      hour12: false
    }).replace(',', ' @')
  }

  // Metrics data
  const metricsData = {
    avg: {
      latency: { value: '245', unit: 'ms', subtitle: `Top ${topN} queries` },
      cpu: { value: '1.2', unit: 'ms', subtitle: `Top ${topN} queries` },
      memory: { value: '45.3', unit: 'MB', subtitle: `Top ${topN} queries` }
    },
    p90: {
      latency: { value: '580', unit: 'ms', subtitle: '90th percentile' },
      cpu: { value: '2.8', unit: 'ms', subtitle: '90th percentile' },
      memory: { value: '89.7', unit: 'MB', subtitle: '90th percentile' }
    },
    p99: {
      latency: { value: '850', unit: 'ms', subtitle: '99th percentile' },
      cpu: { value: '4.5', unit: 'ms', subtitle: '99th percentile' },
      memory: { value: '125.4', unit: 'MB', subtitle: '99th percentile' }
    }
  }

  // Combined Metrics Card Component with Dropdown
  const CombinedMetricCard = ({ title, metrics, selectedMetric, onMetricChange }) => {
    const currentMetric = metrics[selectedMetric]
    
    return (
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #d3dae6',
        borderRadius: '8px',
        padding: '20px',
        minWidth: '250px',
        flex: '0 0 auto',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <div style={{ 
            fontSize: '12px', 
            color: '#69707d', 
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            {title}
          </div>
          <select
            value={selectedMetric}
            onChange={(e) => onMetricChange(e.target.value)}
            style={{
              padding: '4px 8px',
              fontSize: '11px',
              border: '1px solid #d3dae6',
              borderRadius: '4px',
              backgroundColor: '#ffffff',
              color: '#1a1a1a',
              cursor: 'pointer'
            }}
          >
            <option value="latency">Latency</option>
            <option value="cpu">CPU Time</option>
            <option value="memory">Memory</option>
          </select>
        </div>
        <div style={{ 
          fontSize: '10px', 
          color: '#98a2b3', 
          marginBottom: '12px'
        }}>
          {currentMetric.subtitle}
        </div>
        <div style={{ 
          fontSize: '32px', 
          fontWeight: '600', 
          color: '#1a1a1a',
          display: 'flex',
          alignItems: 'baseline',
          gap: '4px'
        }}>
          {currentMetric.value}
          <span style={{ fontSize: '16px', fontWeight: '400', color: '#69707d' }}>
            {currentMetric.unit}
          </span>
        </div>
      </div>
    )
  }

  // Metrics Card Component
  const MetricCard = ({ title, subtitle, value, unit }) => (
    <div style={{
      backgroundColor: '#ffffff',
      border: '1px solid #d3dae6',
      borderRadius: '8px',
      padding: '16px',
      minWidth: '150px',
      flex: '1 1 0',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }}>
      <div style={{ 
        fontSize: '11px', 
        color: '#69707d', 
        marginBottom: '4px',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }}>
        {title}
      </div>
      {subtitle && (
        <div style={{ 
          fontSize: '9px', 
          color: '#98a2b3', 
          marginBottom: '10px'
        }}>
          {subtitle}
        </div>
      )}
      <div style={{ 
        fontSize: '28px', 
        fontWeight: '600', 
        color: '#1a1a1a',
        display: 'flex',
        alignItems: 'baseline',
        gap: '4px'
      }}>
        {value}
        <span style={{ fontSize: '14px', fontWeight: '400', color: '#69707d' }}>
          {unit}
        </span>
      </div>
    </div>
  )

  // 1. Metrics Panel - Column Chart
  const metricsChart = {
    chart: { 
      type: 'column', 
      height: 200,
      backgroundColor: 'transparent'
    },
    title: { 
      text: 'Top N Queries - Key Metrics',
      style: { color: '#ffffff' }
    },
    xAxis: { 
      categories: ['Avg Latency', 'Avg CPU', 'Avg Memory', 'P90 Latency', 'P90 CPU', 'P90 Memory'],
      labels: { style: { color: '#cccccc' } }
    },
    yAxis: { 
      title: { text: 'Value' }, 
      labels: { enabled: false }
    },
    legend: { enabled: false },
    plotOptions: { 
      column: { 
        dataLabels: { 
          enabled: true, 
          format: '{point.label}',
          style: { fontSize: '11px', color: '#ffffff', textOutline: 'none' }
        } 
      } 
    },
    series: [{
      name: 'Metrics',
      data: [
        { y: 245, label: '245 ms<br/>↑ 12%', color: '#FF6B6B' },
        { y: 1.2, label: '1.2 ms<br/>↓ 5%', color: '#51CF66' },
        { y: 45.3, label: '45.3 MB<br/>↑ 8%', color: '#FF6B6B' },
        { y: 580, label: '580 ms<br/>↑ 15%', color: '#FF6B6B' },
        { y: 2.8, label: '2.8 ms<br/>↓ 3%', color: '#51CF66' },
        { y: 89.7, label: '89.7 MB<br/>↑ 11%', color: '#FF6B6B' }
      ]
    }]
  }

  // 2. Distribution Data - Node, User, Index
  const distributionData = {
    node: [
      { name: 'Node-1', y: 450, color: '#4C9AFF' },
      { name: 'Node-2', y: 300, color: '#FF991F' },
      { name: 'Node-3', y: 250, color: '#36B37E' },
      { name: 'Node-4', y: 200, color: '#9C27B0' },
      { name: 'Node-5', y: 150, color: '#FF6B6B' }
    ],
    user: [
      { name: 'user_admin', y: 520, color: '#4C9AFF' },
      { name: 'user_analyst', y: 380, color: '#FF991F' },
      { name: 'user_dev', y: 290, color: '#36B37E' },
      { name: 'user_guest', y: 160, color: '#9C27B0' }
    ],
    index: [
      { name: 'orders-*', y: 380, color: '#4C9AFF' },
      { name: 'users-*', y: 280, color: '#FF991F' },
      { name: 'logs-*', y: 340, color: '#36B37E' },
      { name: 'metrics-*', y: 220, color: '#9C27B0' },
      { name: 'events-*', y: 180, color: '#FF6B6B' }
    ]
  }

  const currentDistributionData = distributionData[queriesByDimension]

  const distributionChart = {
    chart: { 
      type: 'pie', 
      height: 300,
      backgroundColor: 'transparent'
    },
    title: { 
      text: null
    },
    plotOptions: { 
      pie: { 
        innerSize: '60%', 
        dataLabels: { 
          enabled: false
        },
        showInLegend: false
      } 
    },
    series: [{
      name: 'Query Count',
      data: currentDistributionData
    }]
  }

  // 3. Timeline Chart
  const getPerformanceLineChart = () => {
    const metricConfig = {
      latency: {
        title: 'Performance Over Time - Latency',
        yAxisTitle: 'Latency (ms)',
        min: [80, 95, 130, 140, 120, 130, 150, 140, 130, 115],
        avg: [120, 150, 200, 210, 180, 195, 220, 205, 190, 170],
        max: [180, 220, 280, 290, 250, 270, 300, 285, 260, 240]
      },
      cpu: {
        title: 'Performance Over Time - CPU',
        yAxisTitle: 'CPU Time (ms)',
        min: [0.5, 0.6, 0.8, 0.9, 0.7, 0.8, 1.0, 0.9, 0.8, 0.7],
        avg: [1.2, 1.5, 2.0, 2.1, 1.8, 1.9, 2.2, 2.0, 1.9, 1.7],
        max: [2.5, 3.0, 3.5, 3.8, 3.2, 3.4, 3.9, 3.6, 3.3, 3.0]
      },
      memory: {
        title: 'Performance Over Time - Memory',
        yAxisTitle: 'Memory Usage (MB)',
        min: [20, 25, 30, 35, 28, 32, 38, 34, 30, 26],
        avg: [45, 52, 60, 65, 58, 62, 68, 64, 60, 54],
        max: [85, 95, 110, 120, 105, 115, 125, 118, 110, 100]
      }
    }

    const config = metricConfig[performanceMetric]

    return {
      chart: { 
        type: 'line', 
        height: 400,
        backgroundColor: 'transparent'
      },
      title: { 
        text: null
      },
      xAxis: { 
        categories: ['10:00', '10:15', '10:30', '10:45', '11:00', '11:15', '11:30', '11:45', '12:00', '12:15'], 
        title: { text: 'Time', style: { color: '#69707d' } },
        labels: { style: { color: '#1a1a1a' } }
      },
      yAxis: { 
        title: { text: config.yAxisTitle, style: { color: '#69707d' } }, 
        min: 0,
        labels: { style: { color: '#1a1a1a' } }
      },
      legend: {
        itemStyle: { color: '#1a1a1a' }
      },
      series: [
        { 
          name: 'Max', 
          data: config.max, 
          color: '#FF6B6B', 
          lineWidth: 2 
        },
        { 
          name: 'Average', 
          data: config.avg, 
          color: '#4C9AFF', 
          lineWidth: 3 
        },
        { 
          name: 'Min', 
          data: config.min, 
          color: '#36B37E', 
          lineWidth: 2 
        }
      ]
    }
  }

  const timelineChart = {
    chart: { 
      type: 'line', 
      height: 400,
      backgroundColor: 'transparent'
    },
    title: { 
      text: 'Query Performance Timeline',
      style: { color: '#ffffff' }
    },
    subtitle: { 
      text: 'Latency over time (Average aggregation)',
      style: { color: '#cccccc' }
    },
    xAxis: { 
      categories: ['10:00', '10:15', '10:30', '10:45', '11:00', '11:15', '11:30', '11:45', '12:00', '12:15'], 
      title: { text: 'Time', style: { color: '#cccccc' } },
      labels: { style: { color: '#cccccc' } }
    },
    yAxis: { 
      title: { text: 'Latency (ms)', style: { color: '#cccccc' } }, 
      min: 0,
      labels: { style: { color: '#cccccc' } }
    },
    legend: {
      itemStyle: { color: '#cccccc' }
    },
    series: [
      { 
        name: 'Max', 
        data: [180, 220, 280, 290, 250, 270, 300, 285, 260, 240], 
        color: '#FF6B6B', 
        lineWidth: 2 
      },
      { 
        name: 'Average', 
        data: [120, 150, 200, 210, 180, 195, 220, 205, 190, 170], 
        color: '#4C9AFF', 
        lineWidth: 3 
      },
      { 
        name: 'Min', 
        data: [80, 95, 130, 140, 120, 130, 150, 140, 130, 115], 
        color: '#36B37E', 
        lineWidth: 2 
      }
    ]
  }

  // 4. Index Distribution - Donut Chart
  const indexData = [
    { name: 'orders-*', y: 380, color: '#4C9AFF' },
    { name: 'users-*', y: 280, color: '#FF991F' },
    { name: 'logs-*', y: 340, color: '#36B37E' },
    { name: 'metrics-*', y: 220, color: '#9C27B0' },
    { name: 'events-*', y: 180, color: '#FF6B6B' }
  ]

  const indexChart = {
    chart: { 
      type: 'pie', 
      height: 300,
      backgroundColor: 'transparent'
    },
    title: { 
      text: null
    },
    plotOptions: { 
      pie: { 
        innerSize: '60%', 
        dataLabels: { 
          enabled: true, 
          format: '{point.name}<br/>{point.percentage:.1f}%',
          style: { color: '#1a1a1a', textOutline: 'none', fontSize: '12px' }
        },
        showInLegend: true
      } 
    },
    legend: {
      align: 'right',
      verticalAlign: 'middle',
      layout: 'vertical',
      itemStyle: { color: '#1a1a1a', fontSize: '12px' }
    },
    series: [{
      name: 'Query Count',
      data: indexData
    }]
  }

  // 5. Index Comparison Chart
  const indexComparisonChart = {
    chart: { 
      type: 'line', 
      height: 400,
      backgroundColor: 'transparent'
    },
    title: { 
      text: 'Average Latency by Index',
      style: { color: '#ffffff' }
    },
    subtitle: { 
      text: 'Comparison across indexes over time',
      style: { color: '#cccccc' }
    },
    xAxis: { 
      categories: ['10:00', '10:15', '10:30', '10:45', '11:00', '11:15', '11:30', '11:45', '12:00', '12:15'], 
      title: { text: 'Time', style: { color: '#cccccc' } },
      labels: { style: { color: '#cccccc' } }
    },
    yAxis: { 
      title: { text: 'Average Latency (ms)', style: { color: '#cccccc' } }, 
      min: 0,
      labels: { style: { color: '#cccccc' } }
    },
    legend: {
      itemStyle: { color: '#cccccc' }
    },
    series: [
      { 
        name: 'orders-* (Avg: 245ms)', 
        data: [200, 220, 260, 280, 250, 240, 270, 265, 250, 230], 
        color: '#4C9AFF', 
        lineWidth: 2 
      },
      { 
        name: 'users-* (Avg: 198ms)', 
        data: [180, 190, 210, 220, 200, 195, 215, 205, 195, 185], 
        color: '#FF991F', 
        lineWidth: 2 
      },
      { 
        name: 'logs-* (Avg: 215ms)', 
        data: [190, 210, 230, 240, 220, 215, 235, 225, 215, 205], 
        color: '#36B37E', 
        lineWidth: 2 
      },
      { 
        name: 'metrics-* (Avg: 180ms)', 
        data: [160, 170, 190, 200, 180, 175, 195, 185, 175, 165], 
        color: '#9C27B0', 
        lineWidth: 2 
      }
    ]
  }

  // 6. Custom Heatmap using HTML/CSS to match the image style
  const HeatmapComponent = () => {
    const dimensionData = {
      index: ['orders-*', 'users-*', 'logs-*', 'metrics-*'],
      node: ['node-1', 'node-2', 'node-3', 'node-4'],
      user: ['user_admin', 'user_analyst', 'user_dev', 'user_guest'],
      role: ['admin', 'analyst', 'developer', 'viewer'],
      wlmGroup: ['group1', 'group2', 'group3', 'group4'],
      shape: ['shape_A', 'shape_B', 'shape_C', 'shape_D']
    }

    const metricUnits = {
      count: '',
      latency: 'ms',
      cpu: 'ms',
      memory: 'MB'
    }

    const metricLabels = {
      count: 'Count',
      latency: 'Latency',
      cpu: 'CPU Time',
      memory: 'Memory Usage'
    }

    const dimensionLabels = {
      index: 'Index',
      node: 'Node',
      user: 'User',
      role: 'Role',
      wlmGroup: 'WLM Group',
      shape: 'Shape'
    }

    const timeLabels = ['10:00', '10:15', '10:30', '10:45', '11:00', '11:15', '11:30', '11:45', '12:00', '12:15', '12:30', '12:45', '13:00']
    
    // Generate heatmap data based on selected dimension and metric - memoized to prevent regeneration
    const heatmapData = useMemo(() => {
      const rows = dimensionData[heatmapDimension]
      
      // Seeded random generator for consistent values
      const generateValue = (rowIdx, colIdx, metric) => {
        const seed = rowIdx * 1000 + colIdx * 100 + metric.charCodeAt(0)
        const pseudoRandom = Math.sin(seed) * 10000
        const random = pseudoRandom - Math.floor(pseudoRandom)
        
        switch(metric) {
          case 'count':
            return Math.floor(random * 50) + 10
          case 'latency':
            return Math.floor(random * 400) + 100
          case 'cpu':
            return (random * 5).toFixed(1)
          case 'memory':
            return Math.floor(random * 150) + 50
          default:
            return 0
        }
      }
      
      return rows.map((row, rowIdx) => ({
        label: row,
        times: timeLabels.map((_, colIdx) => generateValue(rowIdx, colIdx, heatmapMetric))
      }))
    }, [heatmapDimension, heatmapMetric])
    
    // Sample queries for each dimension
    const sampleQueries = {
      'orders-*': [
        'SELECT * FROM orders WHERE status = "pending"',
        'UPDATE orders SET status = "completed" WHERE id = ?',
        'SELECT COUNT(*) FROM orders WHERE created_at > ?'
      ],
      'users-*': [
        'SELECT * FROM users WHERE active = true',
        'UPDATE users SET last_login = NOW() WHERE id = ?',
        'SELECT email FROM users WHERE role = "admin"'
      ],
      'logs-*': [
        'INSERT INTO audit_logs (action, user_id, timestamp)',
        'SELECT * FROM error_logs WHERE level = "ERROR"',
        'DELETE FROM logs WHERE created_at < ?'
      ],
      'metrics-*': [
        'SELECT AVG(response_time) FROM metrics',
        'INSERT INTO performance_metrics (cpu, memory, timestamp)',
        'SELECT * FROM system_metrics WHERE alert = true'
      ]
    }
    
    const getColor = (value, metric) => {
      let min, max
      
      switch(metric) {
        case 'count':
          min = 10
          max = 60
          break
        case 'latency':
          min = 100
          max = 500
          break
        case 'cpu':
          min = 0
          max = 5
          break
        case 'memory':
          min = 50
          max = 200
          break
        default:
          min = 0
          max = 100
      }
      
      const ratio = (value - min) / (max - min)
      
      if (ratio <= 0.25) return '#E3F2FD'
      if (ratio <= 0.5) return '#BBDEFB'
      if (ratio <= 0.75) return '#90CAF9'
      if (ratio <= 0.9) return '#42A5F5'
      return '#1565C0'
    }
    
    return (
      <div style={{ padding: '20px', backgroundColor: '#ffffff', borderRadius: '8px', position: 'relative' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '100px repeat(13, 1fr)', gap: '1px', backgroundColor: '#d3dae6' }}>
          {/* Empty top-left corner */}
          <div></div>
          {/* Empty header row for top */}
          {timeLabels.map(time => (
            <div key={time}></div>
          ))}
          
          {/* Data rows */}
          {heatmapData.map((row, rowIdx) => (
            <>
              <div key={row.label} style={{ 
                padding: '8px', 
                fontSize: '11px', 
                color: '#1a1a1a',
                backgroundColor: '#f5f7fa',
                display: 'flex',
                alignItems: 'center',
                fontWeight: '500'
              }}>
                {row.label}
              </div>
              {row.times.map((value, colIdx) => (
                <div 
                  key={`${row.label}-${colIdx}`}
                  style={{ 
                    padding: '15px 8px',
                    textAlign: 'center',
                    fontSize: '10px',
                    color: '#000000',
                    backgroundColor: getColor(value, heatmapMetric),
                    border: '1px solid #ffffff',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    position: 'relative',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)'
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)'
                    e.currentTarget.style.zIndex = '10'
                    setHoveredCell({
                      dimension: row.label,
                      time: timeLabels[colIdx],
                      value: value,
                      x: e.currentTarget.getBoundingClientRect().left + e.currentTarget.offsetWidth / 2,
                      y: e.currentTarget.getBoundingClientRect().top - 10
                    })
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)'
                    e.currentTarget.style.boxShadow = 'none'
                    e.currentTarget.style.zIndex = '1'
                    setHoveredCell(null)
                  }}
                >
                  {value}{metricUnits[heatmapMetric]}
                </div>
              ))}
            </>
          ))}
          
          {/* Bottom row - X-axis labels */}
          <div></div>
          {timeLabels.map(time => (
            <div key={`bottom-${time}`} style={{ 
              padding: '8px', 
              textAlign: 'center', 
              fontSize: '11px', 
              color: '#1a1a1a',
              backgroundColor: '#f5f7fa',
              fontWeight: '600'
            }}>
              {time}
            </div>
          ))}
        </div>
        
        {/* Custom Tooltip */}
        {hoveredCell && (
          <div style={{
            position: 'fixed',
            left: `${hoveredCell.x}px`,
            top: `${hoveredCell.y}px`,
            transform: 'translate(-50%, -100%)',
            backgroundColor: '#1a1a1a',
            color: '#ffffff',
            padding: '12px 16px',
            borderRadius: '6px',
            fontSize: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            zIndex: 1000,
            pointerEvents: 'none',
            whiteSpace: 'nowrap'
          }}>
            <div style={{ fontWeight: '600', marginBottom: '4px' }}>
              {dimensionLabels[heatmapDimension]}: {hoveredCell.dimension}
            </div>
            <div style={{ color: '#cccccc', fontSize: '11px', marginBottom: '4px' }}>
              Time: {hoveredCell.time}
            </div>
            <div style={{ color: '#4C9AFF', fontWeight: '600' }}>
              {metricLabels[heatmapMetric]}: {hoveredCell.value}{metricUnits[heatmapMetric]}
            </div>
          </div>
        )}
        
        {/* Legend */}
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '10px', color: '#69707d' }}>Low</span>
            <div style={{ display: 'flex', height: '15px' }}>
              <div style={{ width: '20px', backgroundColor: '#E3F2FD' }}></div>
              <div style={{ width: '20px', backgroundColor: '#BBDEFB' }}></div>
              <div style={{ width: '20px', backgroundColor: '#90CAF9' }}></div>
              <div style={{ width: '20px', backgroundColor: '#42A5F5' }}></div>
              <div style={{ width: '20px', backgroundColor: '#1565C0' }}></div>
            </div>
            <span style={{ fontSize: '10px', color: '#69707d' }}>High</span>
          </div>
        </div>
      </div>
    )
  }

  // Drill-down modal component
  const DrillDownModal = () => {
    if (!showDrillDown || !selectedCell) return null
    
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <div style={{
          backgroundColor: '#1a1a1a',
          padding: '30px',
          borderRadius: '12px',
          maxWidth: '600px',
          width: '90%',
          maxHeight: '80vh',
          overflow: 'auto',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ color: '#ffffff', margin: 0 }}>
              Query Details - {selectedCell.index}
            </h3>
            <button 
              onClick={() => setShowDrillDown(false)}
              style={{
                background: 'none',
                border: 'none',
                color: '#ffffff',
                fontSize: '24px',
                cursor: 'pointer',
                padding: '0',
                width: '30px',
                height: '30px'
              }}
            >
              ×
            </button>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <p style={{ color: '#cccccc', margin: '5px 0' }}>
              <strong>Time Period:</strong> {selectedCell.time}
            </p>
            <p style={{ color: '#cccccc', margin: '5px 0' }}>
              <strong>Average Latency:</strong> {selectedCell.latency}ms
            </p>
            <p style={{ color: '#cccccc', margin: '5px 0' }}>
              <strong>Index Pattern:</strong> {selectedCell.index}
            </p>
          </div>
          
          <h4 style={{ color: '#ffffff', marginBottom: '15px' }}>Top Queries in this time period:</h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {selectedCell.queries.map((query, idx) => (
              <div key={idx} style={{
                backgroundColor: 'rgba(255,255,255,0.05)',
                padding: '15px',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ color: '#646cff', fontSize: '12px', fontWeight: 'bold' }}>
                    Query #{idx + 1}
                  </span>
                  <span style={{ color: '#51CF66', fontSize: '12px' }}>
                    {Math.floor(Math.random() * 50) + 10} executions
                  </span>
                </div>
                <code style={{
                  color: '#ffffff',
                  backgroundColor: 'rgba(0,0,0,0.3)',
                  padding: '8px',
                  borderRadius: '4px',
                  display: 'block',
                  fontSize: '12px',
                  wordBreak: 'break-all'
                }}>
                  {query}
                </code>
                <div style={{ marginTop: '8px', fontSize: '11px', color: '#888' }}>
                  Avg: {Math.floor(Math.random() * 100) + 20}ms | 
                  Max: {Math.floor(Math.random() * 200) + 100}ms | 
                  P95: {Math.floor(Math.random() * 150) + 80}ms
                </div>
              </div>
            ))}
          </div>
          
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <button 
              onClick={() => setShowDrillDown(false)}
              style={{
                backgroundColor: '#646cff',
                color: '#ffffff',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Query Insights - Top N Queries</h1>
        
        {/* Tabs */}
        <div style={{ 
          display: 'flex', 
          gap: '2rem', 
          marginTop: '1.5rem',
          borderBottom: '2px solid #d3dae6'
        }}>
          <button
            onClick={() => setActiveTab('live')}
            style={{
              padding: '0.75rem 0',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'live' ? '3px solid #0079D3' : '3px solid transparent',
              borderRadius: '0',
              color: activeTab === 'live' ? '#0079D3' : '#69707d',
              fontSize: '1rem',
              fontWeight: activeTab === 'live' ? '600' : '500',
              cursor: 'pointer',
              marginBottom: '-2px',
              transition: 'color 0.2s, border-bottom 0.2s',
              outline: 'none',
              boxShadow: 'none',
              WebkitAppearance: 'none',
              MozAppearance: 'none'
            }}
            onMouseEnter={(e) => {
              if (activeTab !== 'live') {
                e.currentTarget.style.color = '#1a1a1a'
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== 'live') {
                e.currentTarget.style.color = '#69707d'
              }
            }}
          >
            Live queries
          </button>
          <button
            onClick={() => setActiveTab('topN')}
            style={{
              padding: '0.75rem 0',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'topN' ? '3px solid #0079D3' : '3px solid transparent',
              borderRadius: '0',
              color: activeTab === 'topN' ? '#0079D3' : '#69707d',
              fontSize: '1rem',
              fontWeight: activeTab === 'topN' ? '600' : '500',
              cursor: 'pointer',
              marginBottom: '-2px',
              transition: 'color 0.2s, border-bottom 0.2s',
              outline: 'none',
              boxShadow: 'none',
              WebkitAppearance: 'none',
              MozAppearance: 'none'
            }}
            onMouseEnter={(e) => {
              if (activeTab !== 'topN') {
                e.currentTarget.style.color = '#1a1a1a'
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== 'topN') {
                e.currentTarget.style.color = '#69707d'
              }
            }}
          >
            Top N queries
          </button>
          <button
            onClick={() => setActiveTab('config')}
            style={{
              padding: '0.75rem 0',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'config' ? '3px solid #0079D3' : '3px solid transparent',
              borderRadius: '0',
              color: activeTab === 'config' ? '#0079D3' : '#69707d',
              fontSize: '1rem',
              fontWeight: activeTab === 'config' ? '600' : '500',
              cursor: 'pointer',
              marginBottom: '-2px',
              transition: 'color 0.2s, border-bottom 0.2s',
              outline: 'none',
              boxShadow: 'none',
              WebkitAppearance: 'none',
              MozAppearance: 'none'
            }}
            onMouseEnter={(e) => {
              if (activeTab !== 'config') {
                e.currentTarget.style.color = '#1a1a1a'
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== 'config') {
                e.currentTarget.style.color = '#69707d'
              }
            }}
          >
            Configuration
          </button>
        </div>
      </header>

      <div className="controls">
        {/* All Filters in One Row */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '16px' }}>
          {/* Search Bar */}
          <div style={{ flex: '1 1 auto', minWidth: '300px', maxWidth: '600px' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search queries..."
                value={searchValue}
                onChange={(e) => {
                  setSearchValue(e.target.value)
                  setIsPopoverOpen(true)
                  if (!selectedProperty) setCurrentStep('properties')
                }}
                onFocus={() => {
                  setIsPopoverOpen(true)
                  if (!selectedProperty) setCurrentStep('properties')
                }}
                style={{
                  width: '100%',
                  padding: '8px 8px 8px 36px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #d3dae6',
                  borderRadius: '4px',
                  color: '#1a1a1a',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <span style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '16px',
                color: '#69707d'
              }}>
                🔍
              </span>

              {/* Popover - Aligned to search box */}
              {isPopoverOpen && (
                <>
                  <div
                    style={{
                      position: 'fixed',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      zIndex: 999
                    }}
                    onClick={() => {
                      setIsPopoverOpen(false)
                      setCurrentStep('properties')
                      setSelectedProperty(null)
                      setSelectedOperator(null)
                      setValueInput('')
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    marginTop: '4px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #d3dae6',
                    borderRadius: '4px',
                    maxHeight: '400px',
                    overflow: 'auto',
                    zIndex: 1000,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  }}>
                  {currentStep === 'properties' && (
                    <>
                      <div style={{ padding: '8px 12px', borderBottom: '1px solid #d3dae6', backgroundColor: '#f5f7fa' }}>
                        <strong style={{ fontSize: '12px', color: '#69707d', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Properties</strong>
                      </div>
                      {getPropertyOptions().map((prop, index) => (
                        <div
                          key={index}
                          onClick={() => handlePropertySelect(prop)}
                          style={{
                            padding: '10px 12px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            color: '#1a1a1a',
                            borderBottom: index < getPropertyOptions().length - 1 ? '1px solid #f5f7fa' : 'none',
                            transition: 'background-color 0.15s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f7fa'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          {prop.propertyLabel}
                        </div>
                      ))}
                    </>
                  )}
                  
                  {currentStep === 'operators' && (
                    <>
                      <div style={{ padding: '8px 12px', borderBottom: '1px solid #d3dae6', backgroundColor: '#f5f7fa' }}>
                        <strong style={{ fontSize: '12px', color: '#69707d' }}>
                          Use: "{selectedProperty?.propertyLabel}"
                        </strong>
                      </div>
                      <div style={{ padding: '8px 12px', borderBottom: '1px solid #d3dae6', backgroundColor: '#f5f7fa' }}>
                        <strong style={{ fontSize: '12px', color: '#69707d', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Operators</strong>
                      </div>
                      {getOperatorOptions().map((op, index) => (
                        <div
                          key={index}
                          onClick={() => handleOperatorSelect(op)}
                          style={{
                            padding: '10px 12px',
                            cursor: 'pointer',
                            borderBottom: index < getOperatorOptions().length - 1 ? '1px solid #f5f7fa' : 'none',
                            transition: 'background-color 0.15s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f7fa'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <div style={{ color: '#0079D3', fontWeight: 500, fontSize: '14px' }}>
                            {selectedProperty?.propertyLabel} {op.symbol}
                          </div>
                          <div style={{ fontSize: '12px', color: '#69707d', marginTop: '2px' }}>{op.label}</div>
                        </div>
                      ))}
                    </>
                  )}
                  
                  {currentStep === 'values' && (
                    <>
                      {selectedProperty?.type === 'number' || selectedProperty?.type === 'date' ? (
                        <div style={{ padding: '12px' }}>
                          <div style={{ marginBottom: '8px', fontSize: '12px', color: '#69707d' }}>
                            <strong>Use: "{selectedProperty?.propertyLabel} {selectedOperator?.symbol}"</strong>
                          </div>
                          <div style={{ marginBottom: '8px', fontSize: '12px', color: '#69707d' }}>
                            Enter {selectedProperty.type === 'date' ? 'date (YYYY-MM-DD)' : 'numeric value'}:
                          </div>
                          <input
                            type="text"
                            placeholder={selectedProperty.type === 'date' ? '2024-01-14' : '100'}
                            value={valueInput}
                            onChange={(e) => setValueInput(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') handleFreeTextValue()
                            }}
                            autoFocus
                            style={{
                              width: '100%',
                              padding: '8px',
                              backgroundColor: '#ffffff',
                              border: '1px solid #d3dae6',
                              borderRadius: '4px',
                              color: '#1a1a1a',
                              fontSize: '14px',
                              marginBottom: '8px',
                              outline: 'none'
                            }}
                          />
                          <button
                            onClick={handleFreeTextValue}
                            disabled={!valueInput.trim()}
                            style={{
                              width: '100%',
                              padding: '8px',
                              backgroundColor: valueInput.trim() ? '#0079D3' : '#d3dae6',
                              border: 'none',
                              borderRadius: '4px',
                              color: '#ffffff',
                              cursor: valueInput.trim() ? 'pointer' : 'not-allowed',
                              fontSize: '14px',
                              fontWeight: '500'
                            }}
                          >
                            Apply
                          </button>
                        </div>
                      ) : (
                        <>
                          <div style={{ padding: '8px 12px', borderBottom: '1px solid #d3dae6', backgroundColor: '#f5f7fa' }}>
                            <strong style={{ fontSize: '12px', color: '#69707d' }}>
                              Use: "{selectedProperty?.propertyLabel} {selectedOperator?.symbol}"
                            </strong>
                          </div>
                          <div style={{ padding: '8px 12px', borderBottom: '1px solid #d3dae6', backgroundColor: '#f5f7fa' }}>
                            <strong style={{ fontSize: '12px', color: '#69707d', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                              {selectedProperty?.propertyLabel} values
                            </strong>
                          </div>
                          {getValueOptions().map((opt, index) => (
                            <div
                              key={index}
                              onClick={() => handleValueSelect(opt.value)}
                              style={{
                                padding: '10px 12px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                color: '#1a1a1a',
                                borderBottom: index < getValueOptions().length - 1 ? '1px solid #f5f7fa' : 'none',
                                transition: 'background-color 0.15s'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f7fa'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                              {selectedProperty?.propertyLabel} {selectedOperator?.symbol} {opt.value}
                            </div>
                          ))}
                        </>
                      )}
                    </>
                  )}
                  </div>
                </>
              )}
            </div>

            {/* Tokens - Below search bar */}
            {tokens.length > 0 && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginTop: '8px' }}>
                {tokens.map((token, index) => (
                  <span
                    key={index}
                    style={{
                      backgroundColor: '#E6F1FF',
                      border: '1px solid #0079D3',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      fontSize: '12px',
                      color: '#0079D3',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontWeight: '500'
                    }}
                  >
                    {token.property.propertyLabel} {token.operator.symbol} {token.value}
                    <button
                      onClick={() => handleRemoveToken(index)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#0079D3',
                        cursor: 'pointer',
                        padding: '0',
                        fontSize: '16px',
                        lineHeight: '1',
                        fontWeight: 'bold'
                      }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Date Range Picker */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            padding: '8px 12px',
            border: '1px solid #d3dae6',
            borderRadius: '4px',
            backgroundColor: '#ffffff',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            flexShrink: 0
          }}>
            <span style={{ fontSize: '16px', color: '#0079D3' }}>📅</span>
            <span style={{ fontSize: '14px', color: '#1a1a1a' }}>
              {formatDateDisplay(startDate)} → now
            </span>
          </div>
          
          {/* Hidden date inputs for functionality */}
          <div style={{ display: 'none' }}>
            <input
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <input
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: '500',
              border: '1px solid #0079D3',
              borderRadius: '4px',
              backgroundColor: '#ffffff',
              color: '#0079D3',
              cursor: isRefreshing ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              opacity: isRefreshing ? 0.6 : 1,
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
            onMouseEnter={(e) => {
              if (!isRefreshing) {
                e.currentTarget.style.backgroundColor = '#f0f8ff'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#ffffff'
            }}
          >
            <span style={{ 
              fontSize: '16px',
              display: 'inline-block',
              animation: isRefreshing ? 'spin 1s linear infinite' : 'none'
            }}>
              🔄
            </span>
            Refresh
          </button>

          {/* Clear Filters Button */}
          {tokens.length > 0 && (
            <button
              onClick={handleClearAll}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '500',
                border: '1px solid #d3dae6',
                borderRadius: '4px',
                backgroundColor: '#ffffff',
                color: '#1a1a1a',
                cursor: 'pointer',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f5f7fa'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff'
              }}
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      <div className="content">
        <div className="charts-view">
            {/* Metrics Cards Section */}
            <div style={{ marginBottom: '0.5rem' }}>
              {/* All Metrics in One Row */}
              <div style={{ 
                display: 'flex',
                gap: '12px',
                width: '100%'
              }}>
                <MetricCard
                  title="P90 Latency"
                  subtitle="Average"
                  value={metricsData.p90.latency.value}
                  unit={metricsData.p90.latency.unit}
                />
                <MetricCard
                  title="P90 CPU Time"
                  subtitle="Average"
                  value={metricsData.p90.cpu.value}
                  unit={metricsData.p90.cpu.unit}
                />
                <MetricCard
                  title="P90 Memory"
                  subtitle="Average"
                  value={metricsData.p90.memory.value}
                  unit={metricsData.p90.memory.unit}
                />
                <MetricCard
                  title="P99 Latency"
                  subtitle="Average"
                  value={metricsData.p99.latency.value}
                  unit={metricsData.p99.latency.unit}
                />
                <MetricCard
                  title="P99 CPU Time"
                  subtitle="Average"
                  value={metricsData.p99.cpu.value}
                  unit={metricsData.p99.cpu.unit}
                />
                <MetricCard
                  title="P99 Memory"
                  subtitle="Average"
                  value={metricsData.p99.memory.value}
                  unit={metricsData.p99.memory.unit}
                />
              </div>
            </div>

            {/* Queries by - Chart and Table Side by Side */}
            <div className="chart-container" style={{ marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h4 style={{ margin: 0, color: '#1a1a1a', fontSize: '16px', fontWeight: '600' }}>
                  Queries by {queriesByDimension.charAt(0).toUpperCase() + queriesByDimension.slice(1)}
                </h4>
                <select
                  value={queriesByDimension}
                  onChange={(e) => setQueriesByDimension(e.target.value)}
                  style={{
                    padding: '6px 12px',
                    fontSize: '12px',
                    border: '1px solid #d3dae6',
                    borderRadius: '4px',
                    backgroundColor: '#ffffff',
                    color: '#1a1a1a',
                    cursor: 'pointer'
                  }}
                >
                  <option value="node">Node</option>
                  <option value="user">User</option>
                  <option value="index">Index</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
                {/* Pie Chart */}
                <div style={{ flex: '0 0 400px' }}>
                  <HighchartsReact highcharts={Highcharts} options={distributionChart} />
                </div>
                
                {/* Table */}
                <div style={{ flex: '1', minWidth: 0 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #d3dae6' }}>
                        <th style={{ padding: '12px', textAlign: 'left', color: '#1a1a1a', fontSize: '12px', fontWeight: '600' }}>
                          {queriesByDimension.charAt(0).toUpperCase() + queriesByDimension.slice(1)}
                        </th>
                        <th style={{ padding: '12px', textAlign: 'right', color: '#1a1a1a', fontSize: '12px', fontWeight: '600' }}>Query Count</th>
                        <th style={{ padding: '12px', textAlign: 'right', color: '#1a1a1a', fontSize: '12px', fontWeight: '600' }}>Percentage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentDistributionData.map((item, index) => {
                        const total = currentDistributionData.reduce((sum, d) => sum + d.y, 0)
                        const percentage = ((item.y / total) * 100).toFixed(1)
                        return (
                          <tr key={index} style={{ borderBottom: '1px solid #f5f7fa' }}>
                            <td style={{ padding: '12px', color: '#1a1a1a', fontSize: '12px' }}>
                              <span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: item.color, marginRight: '8px', borderRadius: '2px' }}></span>
                              {item.name}
                            </td>
                            <td style={{ padding: '12px', textAlign: 'right', color: '#1a1a1a', fontSize: '12px' }}>{item.y}</td>
                            <td style={{ padding: '12px', textAlign: 'right', color: '#69707d', fontSize: '12px' }}>{percentage}%</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="chart-container" style={{ marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h4 style={{ margin: 0, color: '#1a1a1a', fontSize: '16px', fontWeight: '600' }}>
                  Performance Analysis
                </h4>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {performanceViewMode === 'heatmap' && (
                    <>
                      <select
                        value={heatmapDimension}
                        onChange={(e) => setHeatmapDimension(e.target.value)}
                        style={{
                          padding: '6px 12px',
                          fontSize: '12px',
                          border: '1px solid #d3dae6',
                          borderRadius: '4px',
                          backgroundColor: '#ffffff',
                          color: '#1a1a1a',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="index">Index</option>
                        <option value="node">Node</option>
                        <option value="user">User</option>
                        <option value="role">Role</option>
                        <option value="wlmGroup">WLM Group</option>
                        <option value="shape">Shape</option>
                      </select>
                      <select
                        value={heatmapMetric}
                        onChange={(e) => setHeatmapMetric(e.target.value)}
                        style={{
                          padding: '6px 12px',
                          fontSize: '12px',
                          border: '1px solid #d3dae6',
                          borderRadius: '4px',
                          backgroundColor: '#ffffff',
                          color: '#1a1a1a',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="count">Count</option>
                        <option value="latency">Latency</option>
                        <option value="cpu">CPU</option>
                        <option value="memory">Memory</option>
                      </select>
                    </>
                  )}
                  {performanceViewMode === 'line' && (
                    <select
                      value={performanceMetric}
                      onChange={(e) => setPerformanceMetric(e.target.value)}
                      style={{
                        padding: '6px 12px',
                        fontSize: '12px',
                        border: '1px solid #d3dae6',
                        borderRadius: '4px',
                        backgroundColor: '#ffffff',
                        color: '#1a1a1a',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="latency">Latency</option>
                      <option value="cpu">CPU</option>
                      <option value="memory">Memory</option>
                    </select>
                  )}
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      onClick={() => setPerformanceViewMode('line')}
                      style={{
                        padding: '6px 12px',
                        fontSize: '12px',
                        border: '1px solid #d3dae6',
                        borderRadius: '4px',
                        backgroundColor: performanceViewMode === 'line' ? '#646cff' : '#ffffff',
                        color: performanceViewMode === 'line' ? '#ffffff' : '#1a1a1a',
                        cursor: 'pointer'
                      }}
                    >
                      Line Chart
                    </button>
                    <button
                      onClick={() => setPerformanceViewMode('heatmap')}
                      style={{
                        padding: '6px 12px',
                        fontSize: '12px',
                        border: '1px solid #d3dae6',
                        borderRadius: '4px',
                        backgroundColor: performanceViewMode === 'heatmap' ? '#646cff' : '#ffffff',
                        color: performanceViewMode === 'heatmap' ? '#ffffff' : '#1a1a1a',
                        cursor: 'pointer'
                      }}
                    >
                      Heatmap
                    </button>
                  </div>
                </div>
              </div>
              {performanceViewMode === 'heatmap' ? (
                <HeatmapComponent />
              ) : (
                <HighchartsReact highcharts={Highcharts} options={getPerformanceLineChart()} />
              )}
            </div>

            <QueryList tokens={tokens} searchValue={searchValue} />
          </div>
        </div>

        <DrillDownModal />
      </div>
    )
  }

export default App