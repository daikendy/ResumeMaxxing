'use client';

import React, { memo } from 'react';
import { motion } from 'framer-motion';

interface ResumePreviewProps {
  resumeData: any;
  formatBullet: (text: string) => React.ReactNode;
}

const ResumePreview = memo(({ resumeData, formatBullet }: ResumePreviewProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="flex-grow flex flex-col"
    >
      {/* EXPORT TARGET: Only resume content */}
      <div id="resume-export-target" className="space-y-4 text-zinc-800" style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>

        {/* 1. Header & Contact */}
        <div className="text-center space-y-0.5">
          <h1
            className="text-2xl font-bold tracking-tight text-zinc-900 border-b-2 border-zinc-900 inline-block px-3 pb-1"
            style={{ fontFamily: "'Georgia', serif" }}
          >
            {resumeData.resume_content.contact?.name || "Candidate Name"}
          </h1>
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 text-[9px] uppercase tracking-wider font-sans font-bold text-zinc-500 pt-1">
            {resumeData.resume_content.contact?.email && (
              <span>{resumeData.resume_content.contact.email}</span>
            )}
            {resumeData.resume_content.contact?.phone && (
              <><span className="opacity-30">|</span><span>{resumeData.resume_content.contact.phone}</span></>
            )}
            {resumeData.resume_content.contact?.github && (
              <><span className="opacity-30">|</span><span>{resumeData.resume_content.contact.github}</span></>
            )}
            {resumeData.resume_content.contact?.linkedin && (
              <><span className="opacity-30">|</span><span>{resumeData.resume_content.contact.linkedin}</span></>
            )}
          </div>
        </div>

        {/* 1.5 Professional Summary */}
        {resumeData.resume_content.summary && (
          <div className="pt-2">
            <p
              className="text-[11px] leading-relaxed text-zinc-700 text-center mx-auto max-w-[90%] p-1"
            >
              {resumeData.resume_content.summary}
            </p>
          </div>
        )}

        {/* 2. Professional Experience */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <h3 className="text-[10px] uppercase tracking-[0.3em] font-black text-zinc-400 whitespace-nowrap font-sans">Professional Experience</h3>
            <div className="h-[1px] w-full bg-zinc-200" />
          </div>
          <div className="space-y-3">
            {resumeData.resume_content.experience?.map((exp: any, i: number) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between items-baseline">
                  <h4 className="text-sm font-bold text-zinc-900 font-sans leading-tight">{exp.title}</h4>
                  <span className="text-[9px] font-mono text-zinc-500 font-bold shrink-0 ml-2 tracking-tighter">
                    {exp.startDate ? `${exp.startDate} ${exp.endDate ? `— ${exp.endDate}` : '— Present'}` : (exp.duration || "Present")}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[10px] uppercase tracking-wider font-bold text-zinc-500 font-sans">
                  <div className="italic">{exp.company}</div>
                  {exp.location && <div className="text-[9px] font-normal tracking-widest text-zinc-400">{exp.location}</div>}
                </div>
                {exp.technologies && (
                  <div className="text-[9px] text-zinc-500 italic leading-tight font-sans mt-0.5 opacity-80">
                    {exp.technologies}
                  </div>
                )}
                <ul className="list-disc pl-4 space-y-0.5 marker:text-zinc-300 mt-1">
                  {exp.bullets?.map((b: string, bi: number) => (
                    <li
                      key={bi}
                      className="text-[11px] leading-snug text-zinc-700 pl-1"
                    >
                      {formatBullet(b)}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Projects */}
        {resumeData.resume_content.projects && resumeData.resume_content.projects.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <h3 className="text-[10px] uppercase tracking-[0.3em] font-black text-zinc-400 whitespace-nowrap font-sans">Strategic Projects</h3>
              <div className="h-[1px] w-full bg-zinc-200" />
            </div>
            <div className="space-y-2">
              {resumeData.resume_content.projects.map((proj: any, i: number) => (
                <div key={i} className="space-y-0.5">
                  <div className="flex justify-between items-baseline">
                    <h4 className="text-sm font-bold text-zinc-900 font-sans leading-snug">{proj.title}</h4>
                    <span className="text-[9px] font-mono text-zinc-400 shrink-0 ml-2">
                      {proj.startDate ? `${proj.startDate} ${proj.endDate ? `— ${proj.endDate}` : ''}` : ''}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[9px] uppercase tracking-wider font-bold text-zinc-500 font-sans">
                    {proj.technologies && (
                      <div className="italic leading-tight opacity-80">
                        {proj.technologies}
                      </div>
                    )}
                    {proj.location && <div className="font-normal tracking-widest text-zinc-400 uppercase">{proj.location}</div>}
                  </div>
                  <p className="text-[11px] leading-snug text-zinc-700 italic mt-0.5">
                    {formatBullet(proj.description || "")}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. Skills Matrix */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <h3 className="text-[10px] uppercase tracking-[0.3em] font-black text-zinc-400 whitespace-nowrap font-sans">Technical Skills</h3>
            <div className="h-[1px] w-full bg-zinc-200" />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {resumeData.resume_content.skills?.map((skill: string, i: number) => (
              <span key={i} className="border border-zinc-200 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-zinc-600 bg-zinc-50">
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* 5. Education */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <h3 className="text-[10px] uppercase tracking-[0.3em] font-black text-zinc-400 whitespace-nowrap font-sans">Education</h3>
            <div className="h-[1px] w-full bg-zinc-200" />
          </div>
          {resumeData.resume_content.education?.map((edu: any, i: number) => (
            <div key={i} className="flex justify-between items-start">
              <div className="space-y-0.5">
                <h4 className="text-[11px] font-bold text-zinc-900 font-sans leading-tight">{edu.degree}</h4>
                <div className="flex items-center gap-2">
                  <p className="text-[9px] uppercase tracking-widest text-zinc-600 font-sans font-bold">{edu.institution}</p>
                  {edu.location && <span className="text-[8px] text-zinc-400 tracking-widest uppercase">| {edu.location}</span>}
                </div>
                {edu.gpa && <p className="text-[9px] text-zinc-500 italic mt-0.5">GPA: {edu.gpa}</p>}
              </div>
              <span className="text-[9px] font-mono text-zinc-500 font-bold tracking-tighter">{edu.year}</span>
            </div>
          ))}
        </div>

      </div>
      {/* ========= END EXPORT TARGET ========= */}

      {/* FOOTER ADORNMENT */}
      <div className="print:hidden no-print mt-auto pt-6 border-t border-zinc-100 flex justify-between items-center opacity-40 text-[8px] font-sans tracking-widest uppercase text-zinc-400">
        <span>ResumeMaxxing V0.2 PREMIUM</span>
        <span>System Generated Artifact</span>
      </div>
    </motion.div>
  );
});

ResumePreview.displayName = 'ResumePreview';

export default ResumePreview;
