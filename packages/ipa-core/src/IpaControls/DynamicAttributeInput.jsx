import React from 'react';

import Autosuggest from 'react-autosuggest';

export const defaultTheme = {
  container: {
    position: 'relative'
  },
  input: {
    width: 240,
    height: 30,
    padding: '10px 20px',
    fontFamily: 'Helvetica, sans-serif',
    fontWeight: 300,
    fontSize: 16,
    border: '1px solid #aaa',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4
  },
  inputFocused: {
    outline: 'none'
  },
  inputOpen: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0
  },
  suggestionsContainer: {
    display: 'none'
  },
  suggestionsContainerOpen: {
    display: 'block',
    position: 'relative',
    width: 280,
    border: '1px solid #aaa',
    backgroundColor: '#fff',
    fontFamily: 'Helvetica, sans-serif',
    fontWeight: 300,
    fontSize: 16,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    maxHeight: '200px',
    overflowY: 'auto',
    zIndex: 1000
  },
  suggestionsList: {
    margin: 0,
    padding: 0,
    listStyleType: 'none'
  },
  suggestion: {
    cursor: 'pointer',
    padding: '10px 20px'
    
  },
  suggestionHighlighted: {
    backgroundColor: '#ddd'
  }
};

export class DynamicAttributeInput extends React.Component {
    
    constructor(props) {
        super(props);
        
        this.state = {
            dynamicValues: [],
            suggestions: []
        }
        
        this.getSuggestions = this.getSuggestions.bind(this);
        this.getSuggestionValue = this.getSuggestionValue.bind(this);
        this.renderSuggestion = this.renderSuggestion.bind(this);
        this.onSuggestionsFetchRequested = this.onSuggestionsFetchRequested.bind(this);
        this.onSuggestionsClearRequested = this.onSuggestionsClearRequested.bind(this);
        this.fetchOnFocus = this.fetchOnFocus.bind(this);
    }
    
    getSuggestions(value) {
        const inputValue = value.trim().toLowerCase();
        
        let suggs;
        
        if (inputValue.length === 0) return [];
        else if (!!this.props.dynamicValues) {
            suggs = this.props.dynamicValues.filter(dynVal => {
                return dynVal.toLowerCase().includes(inputValue);
            });
        }else {
            suggs = this.state.dynamicValues.filter(dynVal => {
                return dynVal.toLowerCase().includes(inputValue);
            });
        }

        return suggs;
    }
    
    getSuggestionValue(suggestion) {
        return suggestion;
    }
    
    renderSuggestion(suggestion) {
        return <div>{suggestion}</div>;
    }
    
    async onSuggestionsFetchRequested({ value }) {
        this.setState({suggestions: this.getSuggestions(value)});
    }
    
    onSuggestionsClearRequested() {
        this.setState({
            suggestions: []
        });
    };
    
    fetchOnFocus() {
        this.props.fetchValuesOnFocus().then((values) => {
 
            if (!values)
                values = [];
            
            this.setState({dynamicValues: values});

        });
    }
    
    render() {
        
        const { value, suggestions } = this.state;
        
        const inputProps = {
            onFocus: !!this.props.fetchValuesOnFocus ? this.fetchOnFocus : null,
            value: this.props.value,
            onChange: (e, { newValue }) => this.props.onChange(this.props.attribute, newValue),
            type: 'text',
            disabled: !!this.props.isDisabled
        };
        
        if (!!this.props.onBlur)
            inputProps.onBlur = this.props.onBlur;
        
        let theme = Object.assign({}, defaultTheme, this.props.themeOptions);
        
        return  (
            <Autosuggest
                id={this.props.attribute}
                inputProps={inputProps}
                suggestions={suggestions}
                onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
                onSuggestionsClearRequested={this.onSuggestionsClearRequested}
                getSuggestionValue={this.getSuggestionValue}
                renderSuggestion={this.renderSuggestion}
                theme={theme}
            />
        )
    }

}