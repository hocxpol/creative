import React, { useContext, useEffect } from "react";
import { Route as RouterRoute, Redirect, useHistory } from "react-router-dom";

import { AuthContext } from "../context/Auth/AuthContext";
import BackdropLoading from "../components/BackdropLoading";
import { Can } from "../components/Can";

const Route = ({ component: Component, isPrivate = false, ...rest }) => {
	const { isAuth, loading, user } = useContext(AuthContext);
	const history = useHistory();

	useEffect(() => {
		if (!isAuth && isPrivate) {
			history.replace("/login");
		}
	}, [isAuth, isPrivate, history]);

	if (loading) {
		return <BackdropLoading />;
	}

	if (!isAuth && isPrivate) {
		return <Redirect to="/login" />;
	}

	if (isAuth && !isPrivate && (rest.path === "/login" || rest.path === "/signup")) {
		return <Redirect to="/" />;
	}

	// Check if trying to access dashboard without permission
	if (isAuth && rest.path === "/" && user) {
		return (
			<Can
				role={user.profile}
				perform="dashboard:view"
				yes={() => <RouterRoute {...rest} component={Component} />}
				no={() => <Redirect to="/tickets" />}
			/>
		);
	}

	return <RouterRoute {...rest} component={Component} />;
};

export default Route;
