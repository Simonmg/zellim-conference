import React, { Component } from 'react';
import localStorage from 'mobx-localstorage';
import { ToastContainer, toast } from 'react-toastify';

import Api from '../../utils/api';
import ZellimLogo from '../../images/zellim-logo';
import 'bootstrap/dist/css/bootstrap.css';
import 'react-toastify/dist/ReactToastify.css';
import './auth.css';
import ConferenceContainer from '../../layout/ConferenceContainer';

export default class Auth extends Component {

    constructor(props) {
        super(props);
        this.state = {
            user: null,
            password: null,
            success: false,
            zlmToken: null
        }
    }

    componentDidMount() {
        toast.success(
            "One time login for Zellim conference",
            {
                position: 'top-right',
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                draggable: false
            }
        )
    }

    setUser(e) {
        this.setState({
            user:e
        });
    }

    setPassword(e) {
        this.setState({
            password: e
        });
    }

    async submit(e) {
        e.preventDefault();
        const api = new Api();
        const response = await api.login(this.state.user, this.state.password);
        if (response.status === 401) {
            toast.error(
                response.message,
                {
                    position: 'top-right',
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    draggable: false
                }
            )
            return;
        }
        localStorage.setItem('zlmToken', response.zlmToken);
        this.setState({
            zlmToken: response.zlmToken
        });
    }

    render() {

        const { roomUrl } = this.props;

        return(
            this.state.zlmToken ? (
                <ConferenceContainer 
                    token={ this.state.zlmToken }
                    meetUrl={ roomUrl } 
                />
            ) : (
                <div className="d-flex margin-auto justify-content-center w-100 h-100">
                    <div className="d-flex flex-column justify-content-center align-items-center text-white">
                        <ZellimLogo height={128} width={128}/>
                        <div id="login-column" className="w-100">
                            <div id="login-box">
                                <form id="login-form" className="form mt-4" onSubmit={this.submit.bind(this)}>
                                    <h3 className="text-center text-white">Sign in</h3>
                                    <div className="form-group">
                                        <label htmlFor="email">Email:</label>
                                        <input type="email" name="email"id="email" className="zellim-input" onChange={e => this.setUser(e.target.value)} className="form-control" />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="password">Password:</label>
                                        <input type="password" name="password" className="zellim-input" onChange={e => this.setPassword(e.target.value)} id="password" className="form-control" />
                                    </div>
                                    <div className="form-group">
                                        <button className="btn btn-outline-light btn-block w-100 my-4"type="submit">Login</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                    <ToastContainer />
                </div>
                    
            )
        );
    }
}