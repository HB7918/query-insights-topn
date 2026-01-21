import { useState } from 'react'

const QueryList = ({ tokens = [], searchValue = '' }) => {
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(10)

  // Generate sample data
  const generateSampleData = () => {
    const types = ['Group', 'Search', 'Aggregation', 'Match']
    const searchTypes = ['DFS', 'Query Then Fetch', 'Query And Fetch']
    const nodes = ['node1', 'node2', 'node3']
    const indices = ['index1', 'index2', 'index3']
    
    // Helper function to generate UUID-like ID
    const generateUUID = () => {
      const hex = '0123456789abcdef'
      const segments = [8, 4, 4, 4, 12]
      return segments.map(len => {
        let segment = ''
        for (let i = 0; i < len; i++) {
          segment += hex[Math.floor(Math.random() * 16)]
        }
        return segment
      }).join('-')
    }
    
    return Array.from({ length: 50 }, (_, i) => ({
      id: generateUUID(),
      type: types[Math.floor(Math.random() * types.length)],
      queryCount: Math.floor(Math.random() * 1000) + 1,
      timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
      latency: `${(Math.random() * 1000).toFixed(2)} ms`,
      cpuTime: `${(Math.random() * 100).toFixed(2)} ms`,
      memoryUsage: `${(Math.random() * 1024).toFixed(0)} MB`,
      indices: indices[Math.floor(Math.random() * indices.length)],
      searchType: searchTypes[Math.floor(Math.random() * searchTypes.length)],
      coordinatorNode: nodes[Math.floor(Math.random() * nodes.length)],
      totalShards: Math.floor(Math.random() * 20) + 1,
    }))
  }

  const [data] = useState(generateSampleData())

  const filteredData = data.filter(item => {
    const tokenMatch = tokens.every(token => {
      const fieldValue = item[token.property.key]
      if (!fieldValue) return false
      
      const value = fieldValue.toString().toLowerCase()
      const filterValue = token.value.toLowerCase()
      
      if (token.property.type === 'number') {
        const numValue = parseFloat(fieldValue.toString().replace(/[^\d.]/g, ''))
        const numFilter = parseFloat(filterValue.replace(/[^\d.]/g, ''))
        
        switch (token.operator.symbol) {
          case '=': return numValue === numFilter
          case '!=': return numValue !== numFilter
          case '>': return numValue > numFilter
          case '<': return numValue < numFilter
          case '>=': return numValue >= numFilter
          case '<=': return numValue <= numFilter
          default: return true
        }
      }
      
      if (token.property.type === 'date') {
        const dateValue = new Date(fieldValue).getTime()
        const dateFilter = new Date(filterValue).getTime()
        
        switch (token.operator.symbol) {
          case '=': return new Date(fieldValue).toDateString() === new Date(filterValue).toDateString()
          case '!=': return new Date(fieldValue).toDateString() !== new Date(filterValue).toDateString()
          case '>': return dateValue > dateFilter
          case '<': return dateValue < dateFilter
          case '>=': return dateValue >= dateFilter
          case '<=': return dateValue <= dateFilter
          default: return true
        }
      }
      
      switch (token.operator.symbol) {
        case '=': return value === filterValue
        case '!=': return value !== filterValue
        case ':': return value.includes(filterValue)
        case '!:': return !value.includes(filterValue)
        case '^': return value.startsWith(filterValue)
        case '!^': return !value.startsWith(filterValue)
        default: return true
      }
    })

    const textMatch = !searchValue || Object.values(item).some(value =>
      value.toString().toLowerCase().includes(searchValue.toLowerCase())
    )

    return tokenMatch && textMatch
  })

  const pageOfItems = filteredData.slice(
    pageIndex * pageSize,
    (pageIndex + 1) * pageSize
  )

  const totalPages = Math.ceil(filteredData.length / pageSize)

  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#ffffff', 
      borderRadius: '8px',
      marginTop: '0.5rem',
      border: '1px solid #d3dae6',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }}>
      <h3 style={{ color: '#1a1a1a', marginBottom: '0.5rem', fontSize: '18px', fontWeight: '600' }}>Query List</h3>
      
      {/* Match counter */}
      <div style={{ marginBottom: '0.5rem', fontSize: '12px', color: '#69707d' }}>
        {filteredData.length} {filteredData.length === 1 ? 'match' : 'matches'}
      </div>
      
      {/* Table */}
      <div style={{ overflowX: 'auto', border: '1px solid #d3dae6', borderRadius: '4px' }}>
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse',
          fontSize: '12px'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#f5f7fa' }}>
              <th style={{ padding: '12px', textAlign: 'left', color: '#1a1a1a', borderBottom: '2px solid #d3dae6', fontWeight: '600', fontSize: '12px' }}>Id</th>
              <th style={{ padding: '12px', textAlign: 'left', color: '#1a1a1a', borderBottom: '2px solid #d3dae6', fontWeight: '600', fontSize: '12px' }}>Type</th>
              <th style={{ padding: '12px', textAlign: 'left', color: '#1a1a1a', borderBottom: '2px solid #d3dae6', fontWeight: '600', fontSize: '12px' }}>Query Count</th>
              <th style={{ padding: '12px', textAlign: 'left', color: '#1a1a1a', borderBottom: '2px solid #d3dae6', fontWeight: '600', fontSize: '12px' }}>Timestamp</th>
              <th style={{ padding: '12px', textAlign: 'left', color: '#1a1a1a', borderBottom: '2px solid #d3dae6', fontWeight: '600', fontSize: '12px' }}>Latency</th>
              <th style={{ padding: '12px', textAlign: 'left', color: '#1a1a1a', borderBottom: '2px solid #d3dae6', fontWeight: '600', fontSize: '12px' }}>CPU Time</th>
              <th style={{ padding: '12px', textAlign: 'left', color: '#1a1a1a', borderBottom: '2px solid #d3dae6', fontWeight: '600', fontSize: '12px' }}>Memory Usage</th>
              <th style={{ padding: '12px', textAlign: 'left', color: '#1a1a1a', borderBottom: '2px solid #d3dae6', fontWeight: '600', fontSize: '12px' }}>Indices</th>
              <th style={{ padding: '12px', textAlign: 'left', color: '#1a1a1a', borderBottom: '2px solid #d3dae6', fontWeight: '600', fontSize: '12px' }}>Search Type</th>
              <th style={{ padding: '12px', textAlign: 'left', color: '#1a1a1a', borderBottom: '2px solid #d3dae6', fontWeight: '600', fontSize: '12px' }}>Coordinator Node</th>
              <th style={{ padding: '12px', textAlign: 'left', color: '#1a1a1a', borderBottom: '2px solid #d3dae6', fontWeight: '600', fontSize: '12px' }}>Total Shards</th>
            </tr>
          </thead>
          <tbody>
            {pageOfItems.map((item, index) => (
              <tr 
                key={index} 
                style={{ 
                  borderBottom: '1px solid #f5f7fa',
                  transition: 'background-color 0.15s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f7fa'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <td style={{ padding: '12px', color: '#1a1a1a' }}>
                  <a 
                    href={`#/query/${item.id}`} 
                    style={{ 
                      color: '#0079D3', 
                      textDecoration: 'none',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                    onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                  >
                    {item.id}
                  </a>
                </td>
                <td style={{ padding: '12px', color: '#1a1a1a' }}>{item.type}</td>
                <td style={{ padding: '12px', color: '#1a1a1a' }}>{item.queryCount}</td>
                <td style={{ padding: '12px', color: '#1a1a1a' }}>{new Date(item.timestamp).toLocaleString()}</td>
                <td style={{ padding: '12px', color: '#1a1a1a' }}>{item.latency}</td>
                <td style={{ padding: '12px', color: '#1a1a1a' }}>{item.cpuTime}</td>
                <td style={{ padding: '12px', color: '#1a1a1a' }}>{item.memoryUsage}</td>
                <td style={{ padding: '12px', color: '#1a1a1a' }}>{item.indices}</td>
                <td style={{ padding: '12px', color: '#1a1a1a' }}>{item.searchType}</td>
                <td style={{ padding: '12px', color: '#1a1a1a' }}>{item.coordinatorNode}</td>
                <td style={{ padding: '12px', color: '#1a1a1a' }}>{item.totalShards}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      <div style={{ 
        marginTop: '0.5rem', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        fontSize: '12px',
        color: '#69707d'
      }}>
        <div>
          Showing {pageIndex * pageSize + 1} to {Math.min((pageIndex + 1) * pageSize, filteredData.length)} of {filteredData.length}
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={() => setPageIndex(Math.max(0, pageIndex - 1))}
            disabled={pageIndex === 0}
            style={{
              padding: '6px 12px',
              backgroundColor: '#ffffff',
              border: '1px solid #d3dae6',
              borderRadius: '4px',
              color: pageIndex === 0 ? '#98a2b3' : '#1a1a1a',
              cursor: pageIndex === 0 ? 'not-allowed' : 'pointer',
              fontSize: '12px',
              fontWeight: '500'
            }}
          >
            Previous
          </button>
          <span style={{ color: '#1a1a1a' }}>Page {pageIndex + 1} of {totalPages}</span>
          <button
            onClick={() => setPageIndex(Math.min(totalPages - 1, pageIndex + 1))}
            disabled={pageIndex >= totalPages - 1}
            style={{
              padding: '6px 12px',
              backgroundColor: '#ffffff',
              border: '1px solid #d3dae6',
              borderRadius: '4px',
              color: pageIndex >= totalPages - 1 ? '#98a2b3' : '#1a1a1a',
              cursor: pageIndex >= totalPages - 1 ? 'not-allowed' : 'pointer',
              fontSize: '12px',
              fontWeight: '500'
            }}
          >
            Next
          </button>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value))
              setPageIndex(0)
            }}
            style={{
              padding: '6px 8px',
              backgroundColor: '#ffffff',
              border: '1px solid #d3dae6',
              borderRadius: '4px',
              color: '#1a1a1a',
              fontSize: '12px',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
          </select>
        </div>
      </div>
    </div>
  )
}

export default QueryList
