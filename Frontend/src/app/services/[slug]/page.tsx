import { notFound } from "next/navigation";
import { ServiceDetails } from "@/Services/ServiceDetails";
import { serviceData, type ServiceSlug } from "@/Services/serviceData";

export function generateStaticParams(){ return Object.keys(serviceData).map((slug)=>({slug})); }
export default async function Page({params}:{params:Promise<{slug:string}>}){const {slug}=await params;if(!(slug in serviceData))notFound();return <ServiceDetails slug={slug as ServiceSlug}/>;}
