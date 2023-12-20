import React, { useState } from "react";
import pb from "../pocketbase/api/pocketbase";
import Container from "src/components/Container";
import { useForm } from "react-hook-form";
import Posts from "./Posts";

interface AuthType {
  email: string;
  password: string;
}

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isLogout, setIsLogout] = useState(false);
  const [isError, setIsError] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const isUserValidated = pb.authStore.isValid;

  function logoutUser() {
    pb.authStore.clear();
    setIsLogout(!isLogout);
  }

  async function loginUser(data: AuthType) {
    setIsLoading(true);
    try {
      const authenticationData = await pb
        .collection("users")
        .authWithPassword(data.email, data.password);
      setIsError(false);
    } catch (error: any) {
      console.log(error);
      if (error.status === 400) {
        setIsError(true);
        setTimeout(() => {
          setIsError(false)
        }, 3000);
      }
    }
    setIsLoading(false);
    reset();
  }

  const Header = () => {
    return (
      <>
        <div className="bg-purple-100 font-extrabold text-4xl p-8">
          <div className="flex flex-row justify-between">
            <p>Aaron's App</p>
            {isUserValidated && 
            <p>WELCOME IN {(pb.authStore.model!.email as string).toUpperCase()}</p>
          }
            {isUserValidated && (
              <button
                onClick={() => logoutUser()}
                className="w-40 bg-purple-600 text-white font-light text-xl rounded-md py-1"
              >
                <p>Logout</p>
              </button>
            )}
          </div>
        </div>
      </>
    );
  };

  return (
    <>
      <Header />
      <Container>
        {!isUserValidated ? (
          <div className="space-y-5">
            <p className="text-4xl py-4 font-light text-center">Login</p>
            <form
              onSubmit={handleSubmit(loginUser as never)}
              className="flex flex-col space-y-4 items-center"
            >
              <div className="space-y-2">
                <p className="text-xl font-semibold">Email</p>
                <input
                  placeholder="Enter your email"
                  type="text"
                  className="text-3xl py-2 px-4"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                      message: "Invalid email address",
                    },
                  })}
                />
                {errors.email && <p className="text-red-500 text-lg">{errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <p className="text-xl font-semibold">Password</p>
                <input
                  placeholder="Enter your password"
                  type="password"
                  className="text-3xl py-2 px-4"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters",
                    },
                  })}
                />
                {errors.password && <p className="text-red-500 text-lg">{errors.password.message}</p>}
              </div>
              {isError && (
                <p className="text-red-500 text-xl">
                  That account doesn't seem to exist... Try again
                </p>
              )}
              <button className="w-1/3 bg-purple-900 text-white font-light text-2xl rounded-md py-2">
                <p>{isLoading ? "Loading..." : "Login"}</p>
              </button>
            </form>
          </div>
        ) : (
          <Posts />
        )}
      </Container>
    </>
  );
};

export default Login;
