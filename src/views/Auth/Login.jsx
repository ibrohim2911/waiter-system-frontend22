import { useFormik } from 'formik';
import { useNavigate } from 'react-router';
import { useState } from 'react';
import { loginSchema } from '../../schemas';
import { useLogin, usePinLogin } from '../../services/login';

const Numpad = ({ onInput, onDelete, onClear }) => (
    <div className="grid grid-cols-3 gap-2 mt-4 w-full">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
            <button
                key={n}
                type="button"
                className="bg-gray-200 rounded py-6 w-full text-xl hover:bg-gray-300"
                onClick={() => onInput(n.toString())}
            >{n}</button>
        ))}
        <button type="button" className="bg-gray-200 rounded py-6 text-xl" onClick={onClear}>C</button>
        <button type="button" className="bg-gray-200 rounded py-6 text-xl" onClick={() => onInput('0')}>0</button>
        <button type="button" className="bg-gray-200 rounded py-6 text-xl" onClick={onDelete}>⌫</button>
    </div>
);

const Login = () => {
    // const signIn = useSignIn();
    const goPage = useNavigate();
    const [mode, setMode] = useState('pin'); // 'login' or 'pin'
    const login = useLogin();
    const pinLogin = usePinLogin();
    const navigate = (page) => {
        goPage(page);
        window.location.reload();
    }

    const onSubmit = async (values, actions) => {
        try {
            await login(values.phone, values.password);
            navigate('/');
            actions.resetForm();
        } catch (error) {
            throw new Error('error: ' + error.message);
        }

        actions.resetForm();
    };

    const {
        values,
        errors,
        touched,
        isSubmitting,
        handleBlur,
        handleChange,
        resetForm,
        handleSubmit,
    } = useFormik({
        initialValues: {
            phone: '1',
            password: '1',
        },
        onSubmit,
        validationSchema: loginSchema,
    });

    // PIN formik
    const pinFormik = useFormik({
        initialValues: { pin: '' },
        onSubmit: async (values, actions) => {
            // PIN submit logic here
            // Example: navigate('/') if PIN is correct
            try {
                await pinLogin(values.pin);
                navigate('/');
                actions.resetForm();
            } catch (error) {
                console.error('PIN login failed:', error);
            }
        }
    });

    return (
        <div
            className='w-screen h-full absolute z-[999] top-0 left-0 flex justify-end items-center'
            style={{
                backgroundImage: `
                    linear-gradient(
                        to right,
                        rgba(0,0,0,0) 0%,
                        rgba(0,0,0,0) 50%,
                        rgba(0,0,0,0.6) 70%,
                        rgba(0,0,0,0.85) 100%
                    ),
                    url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1500&q=80')
                `,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
            }}
        >
            {/* Centered form container */}
            <div className="bg-white bg-opacity-90 rounded-lg shadow-lg p-12 min-w-[400px] max-w-md mx-24 flex flex-col items-center h-full min-h-[600px] justify-center">
                <div className="flex mb-6 w-full">
                    <button
                        className={`flex-1 py-2 rounded-l ${mode === 'pin' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                        onClick={() => setMode('pin')}
                    >PIN</button>
                    <button
                        className={`flex-1 py-2 rounded-r ${mode === 'login' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                        onClick={() => setMode('login')}
                    >Login</button>
                </div>
                {mode === 'login' ? (
                    <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit}>
                        <input
                            name="phone"
                            type="tel"
                            placeholder="Telefon raqam (998901234567)"
                            className="border rounded px-3 py-2"
                            value={values.phone}
                            onChange={handleChange}
                            onBlur={handleBlur}
                        />
                        {touched.phone && errors.phone && (
                            <div className="text-red-500 text-sm">{errors.phone}</div>
                        )}
                        <input
                            name="password"
                            type="password"
                            placeholder="Password"
                            className="border rounded px-3 py-2"
                            value={values.password}
                            onChange={handleChange}
                            onBlur={handleBlur}
                        />
                        {touched.password && errors.password && (
                            <div className="text-red-500 text-sm">{errors.password}</div>
                        )}
                        <button
                            type="submit"
                            className="bg-blue-600 text-white rounded py-2 mt-2 hover:bg-blue-700"
                            disabled={isSubmitting}
                        >
                            Login
                        </button>
                    </form>
                ) : (
                    <form className="w-full flex flex-col items-center" onSubmit={pinFormik.handleSubmit}>
                        <input
                            name="pin"
                            type="password"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            placeholder="PIN"
                            className="border rounded px-3 py-2 text-center tracking-widest text-2xl mb-2"
                            value={pinFormik.values.pin}
                            readOnly
                        />
                        <Numpad
                            onInput={num => pinFormik.setFieldValue('pin', (pinFormik.values.pin + num).slice(0, 4))}
                            onDelete={() => pinFormik.setFieldValue('pin', pinFormik.values.pin.slice(0, -1))}
                            onClear={() => pinFormik.setFieldValue('pin', '')}
                        />
                        <button
                            type="submit"
                            className="bg-blue-600 text-white rounded text-lg font-bold tracking-widest py-4 mt-4 w-full hover:bg-blue-700"
                        >
                            Enter
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Login;