import React from 'react'
import { Link } from 'react-router'
import ScoreCircle from './ScroreCircle'
import { useEffect } from 'react'
import { usePuterStore } from '~/lib/Puter'
import { useNavigate } from 'react-router'
import { useState } from 'react'


const ResumeCard = ({resume}: {resume:Resume}) => {

    const [resumeUrl, setResumeUrl] = useState('');
    const { auth,fs} =usePuterStore();
    const navigateFunction = useNavigate();
    
    useEffect(()=>{
    
          const loadImage = async ()=>{
            const blob = await fs.read(resume.imagePath);
            if(!blob) return;
            let url = URL.createObjectURL(blob);
            setResumeUrl(url);
    
          }
    
          loadImage();
        },[resume.imagePath])
    

  return (
    <Link to={`/resume/${resume.id}`} className='resume-card animate-in fade-in duration-1000 mb-3'>
        <div className='resume-card-header'>
            <div className='flex flex-col gap-2 '>
                {resume.companyName && <h2 className='!text-black font-bold break-words'>{resume.companyName}</h2>}
                {resume.jobTitle && <h3 className='text-lg  break-words text-gray-500'>{resume.jobTitle}</h3>}

                {!resume.companyName && !resume.jobTitle && <h2 className='!text-black font-bold'>Resume</h2>}
            </div>
            <div className='flex-shrink-0'>
                <ScoreCircle score={resume.feedback.overallScore}></ScoreCircle>
            </div>
        </div>


        {resume.resumePath && (<div className='gradient-border animate-in fade-in duration-1000'>
            <div className='w-full h-full'>
                <img src={resumeUrl} alt="resume" className='w-full h-[350px] max-sm:h-[200px] object-cover object-top' />
            </div>
        </div>)}
        {}
    </Link>
  )
}

export default ResumeCard