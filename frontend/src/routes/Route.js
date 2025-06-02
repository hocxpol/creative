import React, { useContext, useEffect } from "react";
import { Route as RouterRoute, Redirect, useHistory } from "react-router-dom";

import { AuthContext } from "../context/Auth/AuthContext";
import BackdropLoading from "../components/BackdropLoading";

const Route = ({ component: Component, isPrivate = false, ...rest }) => {
	const { isAuth, loading } = useContext(AuthContext);
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

	if (isAuth && !isPrivate) {
		return <Redirect to="/" />;
	}

	return <RouterRoute {...rest} component={Component} />;
};

export default Route;
