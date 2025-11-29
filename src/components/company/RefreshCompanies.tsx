import { useEffect } from "react";
import useCompanyStore from "../../store/companyStore";
import { useLocation } from "react-router-dom";
import axios from "axios";

const RefreshCompanies = () => {

        const refreshButton = useCompanyStore((state)=> state.refreshButton);
        const setRefreshButton = useCompanyStore((state)=> state.setRefreshButton);
        const companies = useCompanyStore((state) => state.companies);
        const refreshCompanies = useCompanyStore((state)=> state.logout);
        const {pathname} = useLocation();

        const fetchDbCompanies = async()=>{
            try {
            const lastCreatedAt = companies.sort((a,b)=> a.createdAt > b.createdAt ? -1: 1)[0];
            const {data: response } = await axios.get(`${import.meta.env.VITE_API}/companies/count?lastcreatedAt=${lastCreatedAt.createdAt}`,{
                withCredentials: true
            });
            if (response.count_companies > 10){
                setRefreshButton(true)
            }
            } catch (error) {
                console.error(error);
            }
        }
        const handleRefresh = ()=>{
            refreshCompanies();
            setRefreshButton(false);
        }
        
    useEffect(()=>{
        setInterval(() => {
        if (companies.length > 0){
            fetchDbCompanies();
        }
        }, 100000);
         // eslint-disable-next-line react-hooks/exhaustive-deps
    },[]);
    
    return (
    <>
        {refreshButton && pathname === "/companies" && (
            <button
            onClick={handleRefresh}
            className="
                fixed bottom-6 left-6 md:left-72
                border border-white text-white px-12 py-4 
                rounded-full tracking-widest uppercase font-bold 
                bg-transparent hover:bg-white active:bg-white 
                active:text-black hover:text-black transition duration-200 
                whitespace-nowrap 
            "
            >
            New Companies
            </button>
        )}
    </>

    );

}

export default RefreshCompanies