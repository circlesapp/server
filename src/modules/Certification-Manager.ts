type Certification = {
	email: string;
	code: number;
	createAt: Date;
};
class CertificationManager {
	certificationList: Certification[];
	constructor() {
		this.certificationList = [];
	}
	createRandomCode(): number {
		return Math.floor(Math.random() * (999999 - 100000)) + 100000;
	}
	clearExpiredCertification(minute: number) {
		let now = new Date();
		this.certificationList = this.certificationList.filter(certification => {
			return (now.getTime() - certification.createAt.getTime()) / 1000 / 60 < minute;
		});
	}
	checkCertification(email: string, code: number): boolean {
		this.clearExpiredCertification(5);
		let certificationIndex = this.certificationList.findIndex(certification => certification.email == email);
		let certification = this.certificationList[certificationIndex];
		if (certification) {
			if (certification.code == code) {
				this.certificationList.splice(certificationIndex, 1);
				return true;
			}
		}
		return false;
	}
	registerCertification(email: string): number {
		this.clearExpiredCertification(10);
		let certificationIndex = this.certificationList.findIndex(certification => certification.email == email);
		let code = this.createRandomCode();
		if (certificationIndex == -1) {
			this.certificationList.push({
				email: email,
				code: code,
				createAt: new Date()
			});
		} else {
			this.certificationList[certificationIndex].code = code;
			this.certificationList[certificationIndex].createAt = new Date();
		}
		return code;
	}
}

export default new CertificationManager();
