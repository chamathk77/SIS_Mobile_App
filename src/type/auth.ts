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

export interface ForgotPassword_EnterEmail_Request {
    email: string;
}

export interface ForgotPassword_EnterEmail_Response {
    success: boolean;
    message: string;
    data: {
        expires_in_minutes: number;
    };
}


export interface ForgotPassword_EnterPin_Request {
    email: string;
    code: string;
}

export interface ForgotPassword_EnterPin_Response {
    success: boolean;
    message: string;
    data: {
        reset_token: string;
        expires_in_minutes: number;
    };
}


export interface ForgotPassword_CreateNewPassword_Request {
    email: string;
    reset_token: string;
    password: string;
    password_confirmation: string;
}

export interface ForgotPassword_CreateNewPassword_Response {
    success: boolean;
    message: string;
}