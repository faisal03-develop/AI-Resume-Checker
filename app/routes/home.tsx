import type { Route } from "./+types/home";
import Navbar from "~/components/Navbar";
import ResumeCard from "~/components/ResumeCard";
import { useEffect, useState } from "react";
import { usePuterStore } from '~/lib/Puter'
import { useNavigate } from 'react-router';
import { Link } from "react-router";




export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resumind" },
    { name: "description", content: "Your Smart Resume Analyzer to help you land your dream Job" },
  ];
}



export default function Home() {


  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loaadingResume, setLoadingResume] =useState(false);
  const [resmeUrl, setResumeUrl] = useState('');
  const { auth,kv} =usePuterStore();
    const navigateFunction = useNavigate();
    useEffect (()=>{
        if(!auth.isAuthenticated) navigateFunction ('/auth?next=/')
    }, [auth.isAuthenticated])

  useEffect(()=>{
    const loadResumes = async ()=>{
      setLoadingResume(true);
      const resumes=(await kv.list('resume:*',true))as KVItem[];

      const parsedResumes = resumes?.map((resume)=>(
        JSON.parse(resume.value) as Resume
      ))
      console.log("ParsedResumes: ", parsedResumes)
      setResumes(parsedResumes || []);
      setLoadingResume(false);
    }

    loadResumes();
  },[])

  return <main className="bg-[url('/images/bg-main.svg')] bg-cover">
    <Navbar />
    <section className="main-section">
      <div className="page-heading py-15">
        <h1>Track you applications and resume ratings</h1>
        {!loaadingResume && resumes?.length === 0?(
          <h2>No resumes found upload your first resume to get feedback</h2>
        ):(
        <h2>Review your submissions and check AI-powered feedbacks</h2>
        )}
      </div>

      {loaadingResume && (
        <div className="flex flex-col items-center justify-center">
          <img src="/images/resume-scan-2.gif" className="w-[200px]" alt="" />
        </div>
      )}
      
    {!loaadingResume && resumes.length > 0 &&(
    <div className="resume-sectipon">
      {resumes.map((resume)=>(
        <ResumeCard key={resume.id} resume={resume} />
      ))}
    </div>
    )}

    {!loaadingResume && resumes?.length===0 && (
      <div className="flex flex-col items-center justify-center gap-4 mt-10">
        <Link to="/upload" className="primary-button w-fit text-xl font-semibold ">Uplaod Resume</Link>
      </div>
    )}
    </section>
  </main>;

}
