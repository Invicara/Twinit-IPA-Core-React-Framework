export const selectStyles = (provided, {isFocused, isDisabled}) => ({
    backgroundColor: isDisabled ? "hsl(0, 0%, 95%)" : "hsl(0, 0%, 100%)",
    border: `2px solid ${isFocused && !isDisabled ? 'var(--app-accent-color)' : '#E6E6E6'}`,
    borderRadius: '5px',
    display: 'flex'
});