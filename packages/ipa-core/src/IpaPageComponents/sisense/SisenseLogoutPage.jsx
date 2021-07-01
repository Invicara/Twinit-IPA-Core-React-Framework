import React from "react";


class SisenseLogoutPage extends React.Component {
    componentDidMount() {
        const redirect_url = this.getSisenseBaseUrl() + "/api/auth/logout";
        window.location.href = redirect_url;
    }

    getSisenseBaseUrl() {
        return sessionStorage.getItem('sisenseBaseUrl')
    }

    render() {
        return null;
    }
}

export default SisenseLogoutPage;

