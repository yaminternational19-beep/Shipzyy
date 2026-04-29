import "./Not-found.css";
// import "../styles/global.css";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="notfound-wrapper">
            <div className="notfound-content">

                <h1 className="oops-text">Oops!</h1>

                <h3 className="notfound-code">
                    404 - PAGE NOT FOUND
                </h3>

                <p className="notfound-text">
                    The page you are looking for might have been removed,
                    had its name changed, or is temporarily unavailable.
                </p>

                <button
                    className="notfound-btn"
                    onClick={() => navigate("/")}
                >
                    GO TO HOMEPAGE
                </button>

            </div>
        </div>
    );
};

export default NotFound;
