// Usage example: 
// export const PinkCheckbox = withStyles(() => ({
//     root: {
//         color: "#B8B8B8",
//         '&.Mui-checked': {
//             color: 'var(--app-accent-color)'
//         },
//     },
//     indeterminate: {
//         color: 'var(--app-accent-color)'
//     },
//     checked: {},
//   }),
//   (props) => <Checkbox
//     icon={<CheckBoxOutlineBlank/>}
//     indeterminateIcon={<IndeterminateCheckBoxRounded/>}
//     checkedIcon={<CheckBox/>}

import { useMemo } from 'react'
import { useTheme } from '@emotion/react'
import styled from '@emotion/styled/macro'


    
//     {...produce(props, props => {delete props.classes.icon})} />
// );

function useStyledComponent(
    styles, //MUI styles function
    WrappedComponent, //Component to style
    props //props to inject into the component
) {
    const theme = useTheme()
    return useMemo(() => {
        const strings = styles(theme, props)

        return styled(WrappedComponent)(strings?.root)
    }, [WrappedComponent, props, styles, theme])
}

export default function withStyles(
    styles, //MUI styles function
    WrappedComponent, //Component to style
) {

    return function Component(props) {
        const StyledComponent = useStyledComponent(styles, WrappedComponent, props);

        return <StyledComponent {...props}/>

    }
}