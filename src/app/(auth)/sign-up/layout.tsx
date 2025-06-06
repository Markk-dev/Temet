interface SignInLayoutProps {
    children:React.ReactNode;
}

const SignInLayout = ({children}: SignInLayoutProps) => {
  return (
    <div>
        {children}
    </div>
  )
}

export default SignInLayout