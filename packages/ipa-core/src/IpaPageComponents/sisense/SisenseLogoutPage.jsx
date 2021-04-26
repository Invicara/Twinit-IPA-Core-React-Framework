import React from "react";
const sisenseBaseUrl = endPointConfig.sisenseBaseUrl;

class SisenseLogoutPage extends React.Component {
    componentDidMount() {
        const redirect_url = sisenseBaseUrl + "/api/auth/logout";
        window.location.href = redirect_url;
    }

    render() {
        return null;
    }
}

export default SisenseLogoutPage;

