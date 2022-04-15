import React from "react";

function withGenericPageErrorBoundary(WrappedComponent) {

    return class ErrorBoundary extends React.Component {
        constructor(props) {
            super(props);
            this.state = {
                hasError: false
            };
        }

        static getDerivedStateFromError(error) {
            // Update state so the next render will show the fallback UI.
            return {hasError: true};
        }

        componentDidCatch(error, errorInfo) {
            // You can also do more with the error here
        }

        render() {
            return this.state.hasError ?
                <div className='page'>
                    <div className="generic-page-body">
                        <div className="inv-error-boundary-container">
                            <span>
                                <i className="fas fa-exclamation-circle point-icon point-error"></i>
                                Something went wrong
                            </span>
                        </div>
                    </div>
                </div>
             : <WrappedComponent {...this.props} />;
        }
    }
}

export default withErrorBoundary;