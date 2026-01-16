import { AxiosResponse } from "axios";

export const BASE_URL: string;
export const Role: string | null;

export function PostData(url: string, data: any): Promise<AxiosResponse<any>>;
export function PostDataToken(url: string, data: any): Promise<AxiosResponse<any>>;
export function PostDataTokenJson(url: string, data: any): Promise<AxiosResponse<any>>;
export function PostSimple(url: string, data?: any): Promise<AxiosResponse<any>>;
export function GetDataSimple(url: string): Promise<any>;
export function DeleteData(url: string): Promise<AxiosResponse<any>>;
