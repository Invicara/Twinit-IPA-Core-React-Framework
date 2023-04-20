import React from "react";

function withGenericPageErrorBoundary(WrappedComponent) {

    return class GenericPageErrorBoundary extends React.Component {
        constructor(props) {
            super(props);
            this.state = {
                hasError: false
            };
            //console.log("GENERIC PAGE ERROR BOUNDARY constructor props.userConfig",{...props.userConfig});
        }

        static getDerivedStateFromError(error) {
            // Update state so the next render will show the fallback UI.
            return {hasError: true};
        }

        componentDidCatch(error, errorInfo) {
            // You can also do more with the error here
            console.error(error);
            console.error(errorInfo);
        }

        render() {
            //console.log("GENERIC PAGE ERROR BOUNDARY render this.props.userConfig",{...this.props.userConfig});
            return this.state.hasError ?
                <div className="inv-error-boundary-container">
                    <span>
                        <i className="fas fa-exclamation-circle point-icon point-error"></i>
                        Something went wrong
                    </span>
                </div>
             : <WrappedComponent {...this.props} />;
        }
    }
}

export default withGenericPageErrorBoundary;