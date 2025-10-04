// Weekend Request Multi-Step Form
class WeekendRequestForm {
    constructor() {
        this.currentStep = 1;
        this.formData = {
            location: '',
            department: '',
            position: '',
            fullName: '',
            employeeId: '',
            selectedDates: []
        };
        this.currentDate = new Date();
        this.selectedDates = [];
        this.init();
    }

    init() {
        this.loadUserData();
        this.setupEventListeners();
        this.generateCalendar();
    }

    loadUserData() {
        const userData = localStorage.getItem('userData');
        if (userData) {
        try {
            const user = JSON.parse(userData);
                this.formData.fullName = user.fullName || '';
                this.formData.employeeId = user.employeeId || '';
                document.getElementById('fullName').value = this.formData.fullName;
                document.getElementById('employeeId').value = this.formData.employeeId;
        } catch (error) {
                console.error('Ошибка загрузки данных пользователя:', error);
            }
        }
    }

    setupEventListeners() {
        document.getElementById('nextStep1').addEventListener('click', () => this.nextStep());
        document.getElementById('prevStep2').addEventListener('click', () => this.prevStep());
        document.getElementById('nextStep2').addEventListener('click', () => this.nextStep());
        document.getElementById('editData').addEventListener('click', () => this.editData());
        document.getElementById('submitWeekend').addEventListener('click', () => this.submitForm());
        document.getElementById('prevMonth').addEventListener('click', () => this.previousMonth());
        document.getElementById('nextMonth').addEventListener('click', () => this.nextMonth());
        document.getElementById('closeSuccessModal').addEventListener('click', () => this.closeSuccessModal());
        document.getElementById('goToDashboard').addEventListener('click', () => this.goToDashboard());
        
        document.getElementById('location').addEventListener('change', (e) => {
            this.formData.location = e.target.value;
        });
        document.getElementById('department').addEventListener('change', (e) => {
            this.formData.department = e.target.value;
        });
        document.getElementById('position').addEventListener('change', (e) => {
            this.formData.position = e.target.value;
        });

        // Удаление выбранных дат
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-date')) {
                const dateIndex = parseInt(e.target.dataset.date) - 1;
                this.removeDate(dateIndex);
            }
        });
    }

    nextStep() {
        if (this.validateCurrentStep()) {
            this.currentStep++;
            this.showStep(this.currentStep);
            if (this.currentStep === 3) {
                this.updateReviewData();
            }
        }
    }

    prevStep() {
        this.currentStep--;
        this.showStep(this.currentStep);
    }

    editData() {
        this.currentStep = 1;
        this.showStep(this.currentStep);
    }

    validateCurrentStep() {
        switch (this.currentStep) {
            case 1:
                return this.validateStep1();
            case 2:
                return this.validateStep2();
            default:
                return true;
        }
    }

    validateStep1() {
        const location = document.getElementById('location').value;
        const department = document.getElementById('department').value;
        const position = document.getElementById('position').value;
        const fullName = document.getElementById('fullName').value;
        const employeeId = document.getElementById('employeeId').value;

        if (!location || !department || !position || !fullName || !employeeId) {
            this.showError('Пожалуйста, заполните все обязательные поля');
            return false;
        }
        return true;
    }

    validateStep2() {
        if (this.selectedDates.length === 0) {
            this.showError('Пожалуйста, выберите хотя бы одну дату');
            return false;
        }
        return true;
    }

    showError(message) {
        alert(message);
    }

    showStep(step) {
        document.querySelectorAll('.form-step').forEach(stepEl => {
            stepEl.classList.remove('active');
        });
        document.getElementById(`step${step}`).classList.add('active');
    }


    generateCalendar() {
        const calendarGrid = document.getElementById('calendarGrid');
        const monthNames = [
            'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
            'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
        ];
        
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        document.getElementById('calendarMonth').textContent = `${monthNames[month]} ${year}`;
        calendarGrid.innerHTML = '';
        
        const dayHeaders = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
        dayHeaders.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'calendar-day-header';
            dayHeader.textContent = day;
            calendarGrid.appendChild(dayHeader);
        });
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startDay = (firstDay.getDay() + 6) % 7;
        
        const prevMonth = new Date(year, month - 1, 0);
        for (let i = startDay - 1; i >= 0; i--) {
            const day = document.createElement('div');
            day.className = 'calendar-day other-month';
            day.textContent = prevMonth.getDate() - i;
            calendarGrid.appendChild(day);
        }
        
        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = day;
            
            const currentDate = new Date(year, month, day);
            const today = new Date();
            
            if (this.isSameDate(currentDate, today)) {
                dayElement.classList.add('today');
            }
            
            if (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
                dayElement.classList.add('weekend');
            }
            
            if (this.isDateSelected(currentDate)) {
                dayElement.classList.add('selected');
            }
            
            if (currentDate < today) {
                dayElement.classList.add('disabled');
            } else {
                dayElement.addEventListener('click', () => this.selectDate(currentDate));
            }
            
            calendarGrid.appendChild(dayElement);
        }
        
        const remainingDays = 42 - (startDay + daysInMonth);
        for (let day = 1; day <= remainingDays; day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day other-month';
            dayElement.textContent = day;
            calendarGrid.appendChild(dayElement);
        }
    }

    selectDate(date) {
        if (this.selectedDates.length >= 2) {
            this.showError('Можно выбрать максимум 2 даты');
            return;
        }
        
        if (this.isDateSelected(date)) {
            return;
        }
        
        this.selectedDates.push(date);
        this.updateSelectedDatesDisplay();
        this.generateCalendar();
    }

    removeDate(index) {
        this.selectedDates.splice(index, 1);
        this.updateSelectedDatesDisplay();
        this.generateCalendar();
    }

    isDateSelected(date) {
        return this.selectedDates.some(selectedDate => this.isSameDate(selectedDate, date));
    }

    isSameDate(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    }

    updateSelectedDatesDisplay() {
        document.getElementById('selectedDate1').style.display = 'none';
        document.getElementById('selectedDate2').style.display = 'none';
        
        this.selectedDates.forEach((date, index) => {
            const dateElement = document.getElementById(`selectedDate${index + 1}`);
            const valueElement = document.getElementById(`dateValue${index + 1}`);
            
            const formattedDate = this.formatDate(date);
            valueElement.textContent = formattedDate;
            dateElement.style.display = 'flex';
        });
    }

    formatDate(date) {
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            weekday: 'long'
        };
        return date.toLocaleDateString('ru-RU', options);
    }

    previousMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.generateCalendar();
    }

    nextMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.generateCalendar();
    }

    updateReviewData() {
        document.getElementById('reviewLocation').textContent = this.formData.location;
        document.getElementById('reviewDepartment').textContent = this.formData.department;
        document.getElementById('reviewPosition').textContent = this.formData.position;
        document.getElementById('reviewFullName').textContent = this.formData.fullName;
        document.getElementById('reviewEmployeeId').textContent = this.formData.employeeId;
        
        const datesText = this.selectedDates.map(date => this.formatDate(date)).join(', ');
        document.getElementById('reviewDates').textContent = datesText;
    }

    async submitForm() {
        if (!this.validateStep2()) {
            return;
        }

        document.getElementById('loadingOverlay').style.display = 'flex';

        try {
            const requestData = {
                ...this.formData,
                selectedDates: this.selectedDates.map(date => date.toISOString().split('T')[0]),
                requestType: 'weekend',
                status: 'pending',
                submittedAt: new Date().toISOString()
            };

            await this.simulateApiCall(requestData);
            document.getElementById('loadingOverlay').style.display = 'none';
            document.getElementById('successModal').style.display = 'flex';

        } catch (error) {
            console.error('Ошибка отправки заявки:', error);
            document.getElementById('loadingOverlay').style.display = 'none';
            this.showError('Произошла ошибка при отправке заявки. Попробуйте еще раз.');
        }
    }

    async simulateApiCall(data) {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('Заявка отправлена:', data);
                resolve(data);
            }, 2000);
        });
    }

    closeSuccessModal() {
        document.getElementById('successModal').style.display = 'none';
    }

    goToDashboard() {
        window.location.href = 'dashboard.html';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new WeekendRequestForm();
});