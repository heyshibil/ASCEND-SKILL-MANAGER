import React, { useEffect } from 'react'
import {useNavigate, useSearchParams} from 'react-router-dom'

const AuthHandler = () => {
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');

    if (token) {
      localStorage.setItem("token", token);
      navigate('/dashboard');
    }

  }, [navigate, searchParams])

  return (
    <div>Finalizing your skill scan...</div>
  )
}

export default AuthHandler