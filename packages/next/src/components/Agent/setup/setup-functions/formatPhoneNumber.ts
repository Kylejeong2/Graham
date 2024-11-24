export const formatPhoneNumber = (phoneNumber: string) => {
    const cleaned = phoneNumber.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
        return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    const match11 = cleaned.match(/^1(\d{3})(\d{3})(\d{4})$/);
    if (match11) {
        return `+1 (${match11[1]}) ${match11[2]}-${match11[3]}`;
    }
    return phoneNumber;
};