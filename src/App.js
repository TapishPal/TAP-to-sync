import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';  
import Home from './pages/Home';
import EditorPage from './pages/EditorPage';

function App() {
    return (
        <BrowserRouter>                                       {/* A <BrowserRouter> stores the current location in the browser's address bar and navigates using the browser's built-in history stack. */}
            <Routes>                                          {/* Routes is used to list the route. */}
                <Route path="/" element={<Home />}></Route>
                <Route
                    path="/editor/:roomId"                           
                    element={<EditorPage />}
                ></Route>
            </Routes>
        </BrowserRouter>
    );
}

{/* The roomId we will extract in EditorPage from url using useParams() */}

export default App;
