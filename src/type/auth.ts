export interface LoginRequest {
    email: string;
    password: string;
    school_subdomain?: string;
    device_name: string;
}

export interface LoginResponse {

    success: boolean;
    message: string;
    data: any;
    
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

export interface ChangePassword_Request {
    current_password: string;
    password: string;
    password_confirmation: string;
}

export interface ChangePassword_Response {
    success: boolean;
    message: string;
}


export interface SelectStudent_Request {
    student_id: string;
}

export interface SelectStudent_Response {
    success: boolean;
    message: string;
    data: {
        student: {
            id: number;  
            school_id: number;
            first_name: string;
            last_name: string;
            full_name: string;
            date_of_birth: string;
            gender: string;
            email: string;
            phone: string;
            admission_number: string;
            registration_number: string;
            avatar_url: string | null;
            blood_group: string;
            nationality: string;
            religion: string;
            status: string;
            enrolled_at: string;
            "admission": {
                id: number;
                status: string;
                academic_year_id: number;
                grade_id: number;
                form_data: any;
                fee_total: number;
                payment_status: string;
                reviewed_at: string | null;
                submitted_at: string | null;
            };
            enrollment: {
                id: number;
                roll_number: string;
                status: string;
                class: { 
                    id: number;
                    name: string;
                    code: string;
                    room: string | null;
                    grade: { id: number; name: string };
                    academic_year: { id: number; name: string };
                };
            };
        };
    };
}


export interface GetStudent_Response {
    success: boolean;
    message: string;
    data: any;
}

export interface GetStudent_Request {
    student_id: string;
}