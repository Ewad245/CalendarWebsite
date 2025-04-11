import { useEffect, useState } from 'react';
import './App.css';
import { User } from './interfaces/type';


function App() {
    const [users, setUsers] = useState<User[]>();

    useEffect(() => {
        async function populateWeatherData() {
            const response = await fetch('https://localhost:7179/api/DataOnly_APIaCheckIn');
            if (response.ok) {
                const data = await response.json();
                console.log(data);
                setUsers(data);
            }
        }
        populateWeatherData();
        
    }, []);


    const contents = users === undefined
        ? <p><em>Loading... Please refresh once the ASP.NET backend has started. See <a href="https://aka.ms/jspsintegrationreact">https://aka.ms/jspsintegrationreact</a> for more details.</em></p>
        : <table className="table table-striped" aria-labelledby="tableLabel">
            <thead>
                <tr>
                    <th>User Id</th>
                    <th>Email</th>
                    <th>In at</th>
                    <th>Out at</th>
                </tr>
            </thead>
            <tbody>
                {users.map(users =>
                    <tr key={users.id}>
                        <td>{users.id}</td>
                        <td>{users.userId}</td>
                        <td>{users.inAt.toString()}</td>
                        <td>{users.outAt.toString()}</td>
                        
                    </tr>
                )}
            </tbody>
        </table>;

    return (
        <div>
            <h1 id="tableLabel">Weather forecast</h1>
            <p>This component demonstrates fetching data from the server.</p>
            {contents}
        </div>
    );

    
}

export default App;