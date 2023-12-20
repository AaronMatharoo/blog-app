import React, { FC } from "react";

const Container: FC = ({ children }) => {
  return <div className="bg-purple-100 min-h-screen h-full flex justify-center">{children}</div>;
};

export default Container;
