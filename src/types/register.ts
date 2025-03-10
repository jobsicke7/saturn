export interface RegistrationData {
    email: string;
    password: string;
    name: string;
    image?: string;
    birthDate?: string;
    isEmailVerified: boolean;
    verificationToken?: string;
    verificationExpires?: Date;
}

export interface RegistrationState {
    step: 'initial' | 'profile' | 'verification';
    formData: {
        email: string;
        password: string;
        name: string;
        image?: string;
        birthDate?: string;
    };
}

