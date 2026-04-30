export interface LoginRequest {
    email: string;
    password: string;
    school_subdomain?: string;
    device_name: string;
}

export interface LoginResponse {

        success: boolean;
        message: string;
        data: {
            access_token: string;
            user: any;
            schools: any[];
            school: any;
        };
    
}
