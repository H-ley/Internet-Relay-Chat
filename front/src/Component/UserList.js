import React from "react";
import axios from 'axios'

export default class UserList extends React.Component {

    state = {
        users: [],
    };

    componentDidMount() {
        axios.get(`http://localhost:8000/api/user/all_user`).then(res => {
            console.log(res);
            this.setState({ users: res.data });
        });
    }

    render() {
        return (<ul>
            {this.state.users.map(user => <li key={user._id}>{user.pseudo}</li>)}
        </ul>);
    }
}
