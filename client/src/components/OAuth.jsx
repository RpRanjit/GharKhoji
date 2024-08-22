import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";
import { firebaseApp } from '../firebase.js';
import { useDispatch } from 'react-redux';
import { signinFailed, signinSuccess } from '../redux/user/userSlice.js';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const OAuth = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleGoogleSignIn = async () => {
        setLoading(true);
        try {
            const auth = getAuth(firebaseApp);
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const { displayName, email, photoURL } = result.user;

            //=====Fetch The Data To Backend====//
            const res = await fetch('/api/auth/google', {
                method: "POST",
                headers: {
                    "Content-Type": 'application/json'
                },
                body: JSON.stringify({
                    name: displayName,
                    email,
                    photo: photoURL,
                })
            });

            const userData = await res.json();
            if (userData.success === false) {
                dispatch(signinFailed(userData.message));
                toast.error(userData.message);
            } else {
                dispatch(signinSuccess(userData));
                toast.success('Signed in successfully!');
                navigate('/home');
            }

        } catch (error) {
            console.log(error);
            toast.error('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div>
                <p className='text-lg text-brand-blue font-heading font-bold text-center mt-3'>OR</p>

                <button
                    onClick={handleGoogleSignIn}
                    className={`mt-3 h-12 px-6 border-2 border-gray-700 rounded-md hover:border-brand-blue focus:bg-blue-50 active:bg-brand-blue w-full ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={loading}>
                    <div className="relative flex items-center space-x-4 justify-center">
                        <img className="absolute left-0 w-5" alt="google logo" src="https://www.svgrepo.com/show/475656/google-color.svg" />
                        <span className="w-max font-semibold tracking-wide text-black dark:text-black text-sm sm:text-base">
                            {loading ? 'Signing in...' : 'Continue with Google'}
                        </span>
                    </div>
                </button>
                <ToastContainer />
            </div>
        </>
    );
}

export default OAuth;
