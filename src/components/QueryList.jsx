import { useState } from 'react'

const QueryList = () => {
  const [searchValue, setSearchValue] = useState('')
  const [tokens, setTokens] = useState([])
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState('properties')
  const [selectedProperty, setSelectedProperty] = useState(null)
  const [selectedOperator, setSelectedOperator] = useState(null)
  const [valueInput, setValueInput] = useState('')
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(10)

  const filteringProperties = [
    { key: 'queryType', propertyLabel: 'Query Type', type: 'enum' },
    { key: 'searchType', propertyLabel: 'Search Type', type: 'enum' },
    { key: 'node', propertyLabel: 'Node', type: 'enum' },
    { key: 'index', propertyLabel: 'Index', type: 'enum' },
    { key: 'wlmGroup', propertyLabel: 'WLM Group', type: 'enum' },
    { key: 'latency', propertyLabel: 'Latency', type: 'number' },
    { key: 'cpu', propertyLabel: 'CPU', type: 'number' },
    { key: 'memory', propertyLabel: 'Memory', type: 'number' },
    { key: 'timestamp', propertyLabel: 'Date and Time', type: 'date' },
  ]

  const filteringOptions = [
    { propertyKey: 'queryType', value: 'Group' },
    { propertyKey: 'queryType', value: 'Search' },
    { propertyKey: 'queryType', value: 'Aggregation' },
    { propertyKey: 'queryType', value: 'Match' },
    { propertyKey: 'searchType', value: 'DFS' },
    { propertyKey: 'searchType', value: 'Query Then Fetch' },
    { propertyKey: 'searchType', value: 'Query And Fetch' },
    { propertyKey: 'node', value: 'node1' },
    { propertyKey: 'node', value: 'node2' },
    { propertyKey: 'node', value: 'node3' },
    { propertyKey: 'index', value: 'index1' },
    { propertyKey: 'index', value: 'index2' },
    { propertyKey: 'index', value: 'index3' },
    { propertyKey: 'wlmGroup', value: 'group1' },
    { propertyKey: 'wlmGroup', value: 'group2' },
    { propertyKey: 'wlmGroup', value: 'group3' },
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

  // Generate sample data
  const generateSampleData = () => {
    const queryTypes = ['Group', 'Search', 'Aggregation', 'Match']
    const searchTypes = ['DFS', 'Query Then Fetch', 'Query And Fetch']
    const nodes = ['node1', 'node2', 'node3']
    const indices = ['index1', 'index2', 'index3']
    const wlmGroups = ['group1', 'group2', 'group3']
    
    return Array.from({ length: 50 }, (_, i) => ({
      id: `q${i + 1}`,
      queryType: queryTypes[Math.floor(Math.random() * queryTypes.length)],
      searchType: searchTypes[Math.floor(Math.random() * searchTypes.length)],
      node: nodes[Math.floor(Math.random() * nodes.length)],
      index: indices[Math.floor(Math.random() * indices.length)],
      wlmGroup: wlmGroups[Math.floor(Math.random() * wlmGroups.length)],
      latency: `${(Math.random() * 1000).toFixed(2)} ms`,
      cpu: `${(Math.random() * 100).toFixed(2)}%`,
      memory: `${(Math.random() * 1024).toFixed(0)} MB`,
      timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
    }))
  }

  const [data] = useState(generateSampleData())

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
      
      {/* Property Filter */}
      <div style={{ marginBottom: '0.5rem', position: 'relative' }}>
        {/* Search Input - Fixed at top */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '0.5rem' }}>
          <div style={{ flex: '1 1 auto', minWidth: 0, position: 'relative' }}>
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
                padding: '8px 8px 8px 32px',
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
              left: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '16px',
              color: '#69707d'
            }}>
              🔍
            </span>
          </div>
          
          {tokens.length > 0 && (
            <button
              onClick={handleClearAll}
              style={{
                padding: '8px 16px',
                backgroundColor: '#ffffff',
                border: '1px solid #d3dae6',
                borderRadius: '4px',
                color: '#1a1a1a',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
            >
              Clear filters
            </button>
          )}
        </div>
        
        {/* Tokens - Below search box */}
        {tokens.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
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
        
        {/* Popover */}
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
              marginTop: '4px',
              backgroundColor: '#ffffff',
              border: '1px solid #d3dae6',
              borderRadius: '4px',
              maxHeight: '300px',
              overflow: 'auto',
              zIndex: 1000,
              minWidth: '400px',
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
              <th style={{ padding: '12px', textAlign: 'left', color: '#1a1a1a', borderBottom: '2px solid #d3dae6', fontWeight: '600', fontSize: '12px' }}>ID</th>
              <th style={{ padding: '12px', textAlign: 'left', color: '#1a1a1a', borderBottom: '2px solid #d3dae6', fontWeight: '600', fontSize: '12px' }}>Query Type</th>
              <th style={{ padding: '12px', textAlign: 'left', color: '#1a1a1a', borderBottom: '2px solid #d3dae6', fontWeight: '600', fontSize: '12px' }}>Search Type</th>
              <th style={{ padding: '12px', textAlign: 'left', color: '#1a1a1a', borderBottom: '2px solid #d3dae6', fontWeight: '600', fontSize: '12px' }}>Node</th>
              <th style={{ padding: '12px', textAlign: 'left', color: '#1a1a1a', borderBottom: '2px solid #d3dae6', fontWeight: '600', fontSize: '12px' }}>Index</th>
              <th style={{ padding: '12px', textAlign: 'left', color: '#1a1a1a', borderBottom: '2px solid #d3dae6', fontWeight: '600', fontSize: '12px' }}>WLM Group</th>
              <th style={{ padding: '12px', textAlign: 'left', color: '#1a1a1a', borderBottom: '2px solid #d3dae6', fontWeight: '600', fontSize: '12px' }}>Latency</th>
              <th style={{ padding: '12px', textAlign: 'left', color: '#1a1a1a', borderBottom: '2px solid #d3dae6', fontWeight: '600', fontSize: '12px' }}>CPU</th>
              <th style={{ padding: '12px', textAlign: 'left', color: '#1a1a1a', borderBottom: '2px solid #d3dae6', fontWeight: '600', fontSize: '12px' }}>Memory</th>
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
                <td style={{ padding: '12px', color: '#1a1a1a' }}>{item.id}</td>
                <td style={{ padding: '12px', color: '#1a1a1a' }}>{item.queryType}</td>
                <td style={{ padding: '12px', color: '#1a1a1a' }}>{item.searchType}</td>
                <td style={{ padding: '12px', color: '#1a1a1a' }}>{item.node}</td>
                <td style={{ padding: '12px', color: '#1a1a1a' }}>{item.index}</td>
                <td style={{ padding: '12px', color: '#1a1a1a' }}>{item.wlmGroup}</td>
                <td style={{ padding: '12px', color: '#1a1a1a' }}>{item.latency}</td>
                <td style={{ padding: '12px', color: '#1a1a1a' }}>{item.cpu}</td>
                <td style={{ padding: '12px', color: '#1a1a1a' }}>{item.memory}</td>
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
