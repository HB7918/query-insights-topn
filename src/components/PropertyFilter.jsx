import React, { useState, useRef, useEffect } from 'react';
import {
  OuiFieldText,
  OuiFlexGroup,
  OuiFlexItem,
  OuiButton,
  OuiBadge,
  OuiPopover,
  OuiSelectable,
  OuiText,
  OuiSpacer,
} from '@opensearch-project/oui';

const PropertyFilter = ({ 
  filteringProperties, 
  filteringOptions, 
  query, 
  onChange,
  placeholder = "Search"
}) => {
  const [inputValue, setInputValue] = useState('');
  const [valueInput, setValueInput] = useState('');
  const [tokens, setTokens] = useState([]);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState('properties'); // properties, operators, values
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [selectedOperator, setSelectedOperator] = useState(null);
  const inputRef = useRef(null);

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
  ];

  useEffect(() => {
    onChange({ tokens, text: inputValue });
  }, [tokens, inputValue]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    
    // Always open popover when typing
    setIsPopoverOpen(true);
    
    // Reset to properties if we're not in a selection flow
    if (!selectedProperty) {
      setCurrentStep('properties');
    }
  };

  const handleInputFocus = () => {
    // Always open popover on focus
    setIsPopoverOpen(true);
    // Reset to properties step if not in a flow
    if (!selectedProperty) {
      setCurrentStep('properties');
    }
  };

  const handlePropertySelect = (property) => {
    setSelectedProperty(property);
    setCurrentStep('operators');
    setInputValue(''); // Clear search when selecting property
  };

  const handleOperatorSelect = (operator) => {
    setSelectedOperator(operator);
    setCurrentStep('values');
    setValueInput(''); // Reset value input when selecting operator
  };

  const handleValueSelect = (value) => {
    const newToken = {
      property: selectedProperty,
      operator: selectedOperator,
      value: value
    };
    
    setTokens([...tokens, newToken]);
    setInputValue('');
    setCurrentStep('properties');
    setSelectedProperty(null);
    setSelectedOperator(null);
    // Close popover after adding token
    setIsPopoverOpen(false);
  };

  const handleFreeTextValue = () => {
    if (valueInput.trim()) {
      const newToken = {
        property: selectedProperty,
        operator: selectedOperator,
        value: valueInput.trim()
      };
      
      setTokens([...tokens, newToken]);
      setInputValue('');
      setValueInput('');
      setCurrentStep('properties');
      setSelectedProperty(null);
      setSelectedOperator(null);
      // Close popover after adding token
      setIsPopoverOpen(false);
    }
  };

  const handleRemoveToken = (index) => {
    const newTokens = tokens.filter((_, i) => i !== index);
    setTokens(newTokens);
  };

  const handleClearAll = () => {
    setTokens([]);
    setInputValue('');
    setIsPopoverOpen(false);
  };

  const getPropertyOptions = () => {
    return filteringProperties
      .filter(prop => 
        prop.propertyLabel.toLowerCase().includes(inputValue.toLowerCase())
      )
      .map(prop => ({
        label: prop.propertyLabel,
        key: prop.key,
        type: prop.type
      }));
  };

  const getOperatorOptions = () => {
    return operators
      .filter(op => op.types.includes(selectedProperty?.type || 'enum'))
      .map(op => ({
        label: `${selectedProperty?.propertyLabel} ${op.symbol}`,
        sublabel: op.label,
        value: op.value
      }));
  };

  const getValueOptions = () => {
    if (!selectedProperty) return [];
    
    // For enum types, show predefined values
    if (selectedProperty.type === 'enum') {
      return filteringOptions
        .filter(opt => opt.propertyKey === selectedProperty.key)
        .map(opt => ({
          label: `${selectedProperty.propertyLabel} ${selectedOperator.symbol} ${opt.value}`,
          value: opt.value
        }));
    }
    
    // For number and date types, allow free text input
    return [];
  };

  const renderPopoverContent = () => {
    if (currentStep === 'properties') {
      const options = getPropertyOptions();
      return (
        <div style={{ width: 400, maxHeight: 300, overflow: 'auto' }}>
          <div style={{ padding: '8px 12px', borderBottom: '1px solid #D3DAE6' }}>
            <OuiText size="xs">
              <strong>Properties</strong>
            </OuiText>
          </div>
          {options.map((option, index) => (
            <div
              key={index}
              style={{
                padding: '8px 12px',
                cursor: 'pointer',
                borderBottom: '1px solid #F5F7FA'
              }}
              onClick={() => handlePropertySelect({ key: option.key, propertyLabel: option.label, type: option.type })}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F5F7FA'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <OuiText size="s">{option.label}</OuiText>
            </div>
          ))}
        </div>
      );
    }

    if (currentStep === 'operators') {
      const options = getOperatorOptions();
      return (
        <div style={{ width: 400, maxHeight: 300, overflow: 'auto' }}>
          <div style={{ padding: '8px 12px', borderBottom: '1px solid #D3DAE6' }}>
            <OuiText size="xs">
              <strong>Use: "{selectedProperty?.propertyLabel}"</strong>
            </OuiText>
          </div>
          <div style={{ padding: '8px 12px', borderBottom: '1px solid #D3DAE6' }}>
            <OuiText size="xs">
              <strong>Operators</strong>
            </OuiText>
          </div>
          {options.map((option, index) => (
            <div
              key={index}
              style={{
                padding: '8px 12px',
                cursor: 'pointer',
                borderBottom: '1px solid #F5F7FA'
              }}
              onClick={() => handleOperatorSelect({ symbol: option.value, label: option.sublabel })}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F5F7FA'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <OuiText size="s" style={{ color: '#006BB4', fontWeight: 500 }}>
                {option.label}
              </OuiText>
              <OuiText size="xs" color="subdued">{option.sublabel}</OuiText>
            </div>
          ))}
        </div>
      );
    }

    if (currentStep === 'values') {
      const options = getValueOptions();
      
      // For number and date types, show input field
      if (selectedProperty.type === 'number' || selectedProperty.type === 'date') {
        return (
          <div style={{ width: 400, padding: 12 }}>
            <div style={{ marginBottom: 8 }}>
              <OuiText size="xs">
                <strong>Use: "{selectedProperty?.propertyLabel} {selectedOperator?.symbol}"</strong>
              </OuiText>
            </div>
            <OuiText size="xs" style={{ marginBottom: 8 }}>
              Enter {selectedProperty.type === 'date' ? 'date (YYYY-MM-DD)' : 'numeric value'}:
            </OuiText>
            <OuiFieldText
              placeholder={selectedProperty.type === 'date' ? '2024-01-14' : '100'}
              value={valueInput}
              onChange={(e) => setValueInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleFreeTextValue();
                }
              }}
              fullWidth
              autoFocus
            />
            <OuiSpacer size="s" />
            <OuiButton
              size="s"
              fill
              onClick={handleFreeTextValue}
              disabled={!valueInput.trim()}
            >
              Apply
            </OuiButton>
          </div>
        );
      }
      
      // For enum types, show list of values
      return (
        <div style={{ width: 400, maxHeight: 300, overflow: 'auto' }}>
          <div style={{ padding: '8px 12px', borderBottom: '1px solid #D3DAE6' }}>
            <OuiText size="xs">
              <strong>Use: "{selectedProperty?.propertyLabel} {selectedOperator?.symbol}"</strong>
            </OuiText>
          </div>
          <div style={{ padding: '8px 12px', borderBottom: '1px solid #D3DAE6' }}>
            <OuiText size="xs">
              <strong>{selectedProperty?.propertyLabel} values</strong>
            </OuiText>
          </div>
          {options.map((option, index) => (
            <div
              key={index}
              style={{
                padding: '8px 12px',
                cursor: 'pointer',
                borderBottom: '1px solid #F5F7FA'
              }}
              onClick={() => handleValueSelect(option.value)}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F5F7FA'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <OuiText size="s">{option.label}</OuiText>
            </div>
          ))}
        </div>
      );
    }
  };

  const button = (
    <div style={{ width: '100%' }}>
      <OuiFlexGroup gutterSize="s" alignItems="center" wrap>
        {tokens.map((token, index) => (
          <OuiFlexItem grow={false} key={index}>
            <OuiBadge
              color="hollow"
              iconType="cross"
              iconSide="right"
              iconOnClick={() => handleRemoveToken(index)}
              iconOnClickAriaLabel="Remove filter"
            >
              {token.property.propertyLabel} {token.operator.symbol} {token.value}
            </OuiBadge>
          </OuiFlexItem>
        ))}
        <OuiFlexItem grow={true}>
          <OuiFieldText
            placeholder={tokens.length === 0 ? placeholder : ''}
            value={inputValue}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            inputRef={inputRef}
            fullWidth
            prepend={<span style={{ padding: '0 8px', display: 'flex', alignItems: 'center', height: '100%' }}>🔍</span>}
          />
        </OuiFlexItem>
      </OuiFlexGroup>
    </div>
  );

  return (
    <OuiFlexGroup gutterSize="m" alignItems="center">
      <OuiFlexItem grow={true}>
        <OuiPopover
          button={button}
          isOpen={isPopoverOpen}
          closePopover={() => {
            setIsPopoverOpen(false);
            // Reset state when popover closes without completing
            setCurrentStep('properties');
            setSelectedProperty(null);
            setSelectedOperator(null);
            setValueInput('');
          }}
          panelPaddingSize="none"
          anchorPosition="downLeft"
          style={{ width: '100%' }}
        >
          {renderPopoverContent()}
        </OuiPopover>
      </OuiFlexItem>
      {tokens.length > 0 && (
        <OuiFlexItem grow={false}>
          <OuiButton onClick={handleClearAll}>
            Clear filters
          </OuiButton>
        </OuiFlexItem>
      )}
    </OuiFlexGroup>
  );
};

export default PropertyFilter;
