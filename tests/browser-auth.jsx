// Test entrypoint only. Never imported by src/index.js or production builds.
import React,{createContext,useContext,useState} from 'react';
const Context=createContext(null);
export function TestAuth({children}){
  const [role,setRole]=useState('admin');
  const value={user:role?{email:role+'@example.test'}:null,session:role?{access_token:role+'-test-token'}:null,loading:false,configured:true,
    signIn:async(email)=>{setRole(email.startsWith('admin')?'admin':'customer');window.__fixtureRole=email.startsWith('admin')?'admin':'customer';},
    signOut:async()=>{setRole(null);window.__fixtureRole=null;}};
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useAuth(){return useContext(Context);}
