// import isDev from './isDev'

export const domain = `http://localhost:19293`;
    // isDev
    // ? `http://localhost:5173/`
    // : 

export const getURL = (pathname: string) =>
  `${domain}${pathname}`;