import React, { type FormEvent } from 'react'
import Navbar from '~/components/Navbar'
import { useState } from 'react'
import FileUploader from '~/components/FileUploader';
import { usePuterStore } from '~/lib/Puter';
import { convertPdfToImage } from '~/lib/pdf2img';
import { generateUUID } from '~/lib/utils';
import { prepareInstructions } from 'constants/index';
import { useNavigate } from "react-router";

const Upload = () => {

    const navigate = useNavigate();
    const {auth, fs,ai,isLoading,kv} =usePuterStore();
    const [file, setFile]= useState<File |null>(null);
    const handleFileSelect = (file:File | null) => {
        setFile(file);
    }

    const handleAnalyze =async({companyName,jobTitle,jobDescription,file}:{companyName:string, jobTitle:string, jobDescription:string, file:File})=>{
        setIsProcessing(true);
        setStatus('Uploading and analyzing your resume...');
        const uploadedFile=await fs.upload([file]);

        if(!uploadedFile) return setStatus('File upload failed.Please try again.');

        setStatus('Converting your resume to image...');
        const imageFile = await convertPdfToImage(file);

        if(!imageFile.file) return setStatus('Failed to Convert Pdf to image, try again');
        setStatus('Uploading the Image...');

        const uploadedImage = await fs.upload([imageFile.file]);

        if(!uploadedImage) return setStatus('Image upload failed, please try again.');

        setStatus('generating feedback..');

        const uuid = generateUUID();

        const data ={
            id: uuid,
            resumePath : uploadedFile.path,
            imagePath: uploadedImage.path,
            companyName,
            jobTitle,
            jobDescription,
            feedback: '',
        }

        await kv.set(`resume:${uuid}`,JSON.stringify(data));
        setStatus('Analyzing resume with AI...');

        const feedback = await ai.feedback(
            uploadedFile.path,
            prepareInstructions({jobTitle, jobDescription})
        )
        if(!feedback) return setStatus('AI analysis failed, please try again.');

        const feedbackText = typeof feedback.message.content === 'string'? feedback.message.content : feedback.message.content[0].text ;

        data.feedback = JSON.parse(feedbackText);
        await kv.set(`resume:${uuid}`, JSON.stringify(data));
        setStatus('Analysis complete! Redirecting to home page...');
        console.log(data);
        navigate(`/resume/${uuid}`);
    }

    const [isProcessing,setIsProcessing]=useState(false);
    const [status,setStatus]=useState('')
    const handleSubmit =(e: FormEvent<HTMLFormElement>)=>{
        e.preventDefault();
        const form = e.currentTarget.closest('form');
        if(!form) return;
        const formData= new FormData(form);

        const companyName = formData.get('company-name')as string;
        const jobTitle = formData.get('job-title')as string;
        const jobDescription = formData.get('job-description')as string;

        if(!file) return;
        handleAnalyze({companyName,jobTitle,jobDescription,file})

    }

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">
    <Navbar />
    <section className="main-section">
        <div className='page-heading'>
            <h1>Smart feedback for your dream Job</h1>
            {isProcessing ? (
                <>
                <h2>{status}</h2>
                <img src="/images/resume-scan.gif" className='w-2/4' />
                </>
            ): (
                <h2>Drop your resume for ATS Score and improvement tips</h2>
            )}
            {!isProcessing && (
                <form id='upload-form' className='flex flex-col gap-4 mt-15' onSubmit={handleSubmit}>
                    <div className='form-div'> 
                        <label htmlFor='company-name'>Company Name</label>
                        <input type="text" name='company-name' placeholder='Company Name' id='company-name' />
                    </div>
                    <div className='form-div'>
                        <label htmlFor='job-title'>Job Title</label>
                        <input type="text" name='job-title' placeholder='Job Title' id='job-title' />
                    </div>
                    <div className='form-div'>
                        <label htmlFor='job-description'>Job Description</label>
                        <textarea rows={5} name='job-description' placeholder='Job Description' id='job-description' />
                    </div>
                    <div className='form-div'>
                        <label htmlFor='uploader'>File Upload</label>
                        <FileUploader onFileSelect={handleFileSelect}/>
                    </div>
                    <button className='primary-button' type='submit'>Analyze Resume </button>
                </form>

            )}
        </div>
    </section>
    </main>
  )
}

export default Upload