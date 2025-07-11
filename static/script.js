// Global variables
let currentUser = null;
let authToken = null;

// Define API base URL
const API_BASE = window.location.origin;

// Add proper initial setup
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('currentUser');

    if (token && user) {
        authToken = token;
        currentUser = JSON.parse(user);
        showLoggedInState();
        showSection('dashboard');
        loadDashboardData();
    }
});

// Authentication Functions
function showAuthTab(tabName) {
    // Hide all auth forms
    document.querySelectorAll('.auth-form').forEach(form => {
        form.classList.remove('active');
    });

    // Remove active class from all tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected form and activate tab
    document.getElementById(`${tabName}-form`).classList.add('active');

    // Find and activate the correct tab button
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        if (btn.textContent.toLowerCase() === tabName.toLowerCase()) {
            btn.classList.add('active');
        }
    });
}

async function login(event) {
    event.preventDefault();

    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch(`${API_BASE}/auth/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                username: username,
                password: password
            })
        });

        if (response.ok) {
            const data = await response.json();
            authToken = data.access_token;
            console.log('Login successful, token received');

            // Get user profile
            const userResponse = await apiRequest('/auth/me');
            if (userResponse.ok) {
                currentUser = await userResponse.json();
                console.log('User profile loaded:', currentUser);

                localStorage.setItem('authToken', authToken);
                localStorage.setItem('currentUser', JSON.stringify(currentUser));

                showLoggedInState();
                showSection('dashboard');
                loadDashboardData();
                showToast('Login successful!', 'success');
            } else {
                console.error('Failed to get user profile');
                showToast('Failed to load user profile', 'error');
            }
        } else {
            const error = await response.json();
            console.error('Login failed:', error);
            showToast(error.detail || 'Login failed', 'error');
        }
    } catch (error) {
        showToast('Network error. Please try again.', 'error');
    }
}

async function register(event) {
    event.preventDefault();

    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;
    const email = document.getElementById('register-email').value;
    const role = document.getElementById('register-role').value;

    // Validate required fields
    if (!username || !password || !email || !role) {
        showToast('Please fill in all required fields', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username.trim(),
                password: password,
                email: email.trim(),
                role: role
            })
        });

        if (response.ok) {
            showToast('Registration successful! Please login.', 'success');
            showAuthTab('login');
            // Clear the form
            document.getElementById('register-form').querySelector('form').reset();
        } else {
            const error = await response.json();
            console.error('Registration error:', error);
            showToast(error.detail || 'Registration failed', 'error');
        }
    } catch (error) {
        console.error('Network error during registration:', error);
        showToast('Network error. Please try again.', 'error');
    }
}

function logout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');

    showLoggedOutState();
    showSection('auth');
    showToast('Logged out successfully', 'success');
}

function showLoggedInState() {
    const authSection = document.getElementById('auth-section');
    if (authSection) authSection.style.display = 'none';

    // Show all navigation links
    const navLinks = ['dashboard-link', 'jobs-link', 'applicants-link', 'interviews-link', 'offers-link', 'matching-link', 'logout-link'];
    navLinks.forEach(linkId => {
        const link = document.getElementById(linkId);
        if (link) link.style.display = 'inline-block';
    });

    // Hide auth link
    const authLink = document.getElementById('auth-link');
    if (authLink) authLink.style.display = 'none';

    // Hide all buttons first
    const allButtons = ['create-job-btn', 'create-applicant-btn', 'create-interview-btn', 'create-offer-btn'];
    allButtons.forEach(btnId => {
        const btn = document.getElementById(btnId);
        if (btn) btn.style.display = 'none';
    });

    // Show/hide buttons based on user role
    if (currentUser && currentUser.role === 'company') {
        const createJobBtn = document.getElementById('create-job-btn');
        const createInterviewBtn = document.getElementById('create-interview-btn');
        const createOfferBtn = document.getElementById('create-offer-btn');

        if (createJobBtn) createJobBtn.style.display = 'block';
        if (createInterviewBtn) createInterviewBtn.style.display = 'block';
        if (createOfferBtn) createOfferBtn.style.display = 'block';
    } else {
        const createApplicantBtn = document.getElementById('create-applicant-btn');
        if (createApplicantBtn) createApplicantBtn.style.display = 'block';
    }
}

function showLoggedOutState() {
    document.getElementById('auth-section').style.display = 'block';

    // Hide all navigation links except auth
    const navLinks = ['dashboard-link', 'jobs-link', 'applicants-link', 'interviews-link', 'offers-link', 'matching-link', 'logout-link'];
    navLinks.forEach(linkId => {
        const link = document.getElementById(linkId);
        if (link) link.style.display = 'none';
    });

    // Show auth link
    const authLink = document.getElementById('auth-link');
    if (authLink) authLink.style.display = 'inline-block';

    // Hide all create buttons
    const buttons = ['create-job-btn', 'create-applicant-btn', 'create-interview-btn', 'create-offer-btn'];
    buttons.forEach(btnId => {
        const btn = document.getElementById(btnId);
        if (btn) btn.style.display = 'none';
    });
}

function showSection(sectionName) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });

    document.getElementById(`${sectionName}-section`).classList.add('active');
    const navLink = document.getElementById(`${sectionName}-link`);
    if (navLink) {
        navLink.classList.add('active');
    }

    // Load data for the section
    switch(sectionName) {
        case 'jobs':
            loadJobs();
            break;
        case 'applicants':
            loadApplicants();
            break;
        case 'interviews':
            loadInterviews();
            break;
        case 'offers':
            loadOffers();
            break;
        case 'matching':
            loadMatching();
            break;
        case 'dashboard':
            loadDashboardData();
            break;
    }
}

// API Helper Functions
async function apiRequest(url, options = {}) {
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        }
    };

    const config = { ...defaultOptions, ...options };
    if (options.headers) {
        config.headers = { ...defaultOptions.headers, ...options.headers };
    }

    try {
        const response = await fetch(`${API_BASE}${url}`, config);

        if (response.status === 401) {
            logout();
            throw new Error('Authentication required');
        }

        return response;
    } catch (error) {
        throw error;
    }
}

// Dashboard Functions
async function loadDashboardData() {
    try {
        // Load stats based on user role
        if (currentUser && currentUser.role === 'company') {
            loadCompanyDashboard();
        } else {
            loadApplicantDashboard();
        }
    } catch (error) {
        showToast('Error loading dashboard data', 'error');
    }
}

async function loadCompanyDashboard() {
    try {
        const [jobsResponse, interviewsResponse, offersResponse] = await Promise.all([
            apiRequest('/jobs/'),
            apiRequest('/interviews/'),
            apiRequest('/offers/')
        ]);

        if (jobsResponse.ok && interviewsResponse.ok && offersResponse.ok) {
            const jobs = await jobsResponse.json();
            const interviews = await interviewsResponse.json();
            const offers = await offersResponse.json();

            // Update dashboard stats if elements exist
            const jobsElement = document.getElementById('jobs-count');
            const interviewsElement = document.getElementById('interviews-count');
            const offersElement = document.getElementById('offers-count');

            if (jobsElement) jobsElement.textContent = jobs.length;
            if (interviewsElement) interviewsElement.textContent = interviews.length;
            if (offersElement) offersElement.textContent = offers.length;
        }
    } catch (error) {
        console.error('Error loading company dashboard:', error);
    }
}

async function loadApplicantDashboard() {
    try {
        const [interviewsResponse, offersResponse] = await Promise.all([
            apiRequest('/interviews/'),
            apiRequest('/offers/')
        ]);

        if (interviewsResponse.ok && offersResponse.ok) {
            const interviews = await interviewsResponse.json();
            const offers = await offersResponse.json();

            // Update dashboard stats if elements exist
            const interviewsElement = document.getElementById('interviews-count');
            const offersElement = document.getElementById('offers-count');

            if (interviewsElement) interviewsElement.textContent = interviews.length;
            if (offersElement) offersElement.textContent = offers.length;
        }
    } catch (error) {
        console.error('Error loading applicant dashboard:', error);
    }
}

// Job Functions
function showJobForm(jobId = null) {
    const modal = document.getElementById('job-form');
    const form = modal.querySelector('form');
    const title = document.getElementById('job-form-title');

    if (jobId) {
        title.textContent = 'Edit Job Position';
        loadJobForEdit(jobId);
    } else {
        title.textContent = 'Create Job Position';
        form.reset();
        document.getElementById('job-id').value = '';
    }

    modal.style.display = 'block';
}

function hideJobForm() {
    document.getElementById('job-form').style.display = 'none';
}

async function loadJobForEdit(jobId) {
    try {
        const response = await apiRequest(`/jobs/${jobId}`);
        if (response.ok) {
            const job = await response.json();
            document.getElementById('job-id').value = job.id;
            document.getElementById('job-title').value = job.title;
            document.getElementById('job-description').value = job.description;
            document.getElementById('job-skills').value = job.skills.join(', ');
            document.getElementById('job-salary').value = job.salary || '';
            document.getElementById('job-location').value = job.location || '';
        }
    } catch (error) {
        showToast('Error loading job data', 'error');
    }
}

async function saveJob(event) {
    event.preventDefault();

    const jobId = document.getElementById('job-id').value;
    const salaryValue = document.getElementById('job-salary').value;
    const locationValue = document.getElementById('job-location').value;

    const jobData = {
        title: document.getElementById('job-title').value,
        description: document.getElementById('job-description').value,
        skills: document.getElementById('job-skills').value.split(',').map(s => s.trim()),
        salary: salaryValue ? parseFloat(salaryValue) : null,
        location: locationValue ? locationValue.trim() : null
    };

    try {
        let response;
        if (jobId) {
            response = await apiRequest(`/jobs/${jobId}`, {
                method: 'PUT',
                body: JSON.stringify(jobData)
            });
        } else {
            response = await apiRequest('/jobs/', {
                method: 'POST',
                body: JSON.stringify(jobData)
            });
        }

        if (response.ok) {
            showToast(jobId ? 'Job updated successfully!' : 'Job created successfully!', 'success');
            hideJobForm();
            loadJobs();
        } else {
            const error = await response.json();
            showToast(error.detail || 'Error saving job', 'error');
        }
    } catch (error) {
        showToast('Network error. Please try again.', 'error');
    }
}

async function loadJobs() {
    try {
        const response = await apiRequest('/jobs/');
        if (response.ok) {
            const jobs = await response.json();
            displayJobs(jobs);
        }
    } catch (error) {
        showToast('Error loading jobs', 'error');
    }
}

function displayJobs(jobs) {
    const jobsList = document.getElementById('jobs-list');
    if (!jobsList) return;

    jobsList.innerHTML = '';

    jobs.forEach(job => {
        const jobCard = document.createElement('div');
        jobCard.className = 'card';
        jobCard.innerHTML = `
            <h3>${job.title}</h3>
            <p><strong>Description:</strong> ${job.description}</p>
            <p><strong>Skills:</strong> ${job.skills.join(', ')}</p>
            ${job.salary ? `<p><strong>Salary:</strong> $${job.salary}</p>` : ''}
            ${job.location ? `<p><strong>Location:</strong> ${job.location}</p>` : ''}
            <div class="card-actions">
                ${currentUser && currentUser.role === 'company' ? `
                    <button class="btn btn-secondary" onclick="showJobForm(${job.id})">Edit</button>
                    <button class="btn btn-danger" onclick="deleteJob(${job.id})">Delete</button>
                ` : ''}
            </div>
        `;
        jobsList.appendChild(jobCard);
    });
}

async function deleteJob(jobId) {
    if (confirm('Are you sure you want to delete this job?')) {
        try {
            const response = await apiRequest(`/jobs/${jobId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                showToast('Job deleted successfully!', 'success');
                loadJobs();
            } else {
                showToast('Error deleting job', 'error');
            }
        } catch (error) {
            showToast('Network error. Please try again.', 'error');
        }
    }
}

// Applicants Functions
async function loadApplicants() {
    try {
        const response = await apiRequest('/applicants/');
        const applicants = await response.json();

        const applicantsList = document.getElementById('applicants-list');
        applicantsList.innerHTML = '';

        applicants.forEach(applicant => {
            const applicantCard = document.createElement('div');
            applicantCard.className = 'card';
            applicantCard.innerHTML = `
                <h3>${applicant.name}</h3>
                <p><strong>Email:</strong> ${applicant.email}</p>
                <p><strong>Phone:</strong> ${applicant.phone || 'Not provided'}</p>
                <p><strong>Skills:</strong> ${applicant.skills ? applicant.skills.join(', ') : 'Not extracted'}</p>
                <p><strong>Experience:</strong> ${applicant.total_experience ? applicant.total_experience + ' years' : 'Not specified'}</p>
                <div class="card-actions">
                    <button class="btn btn-primary" onclick="viewApplicant(${applicant.id})">View Details</button>
                    <button class="btn btn-danger" onclick="deleteApplicant(${applicant.id})">Delete</button>
                </div>
            `;
            applicantsList.appendChild(applicantCard);
        });
    } catch (error) {
        showToast('Error loading applicants', 'error');
    }
}

async function viewApplicant(applicantId) {
    try {
        const response = await apiRequest(`/applicants/${applicantId}`);
        if (response.ok) {
            const applicant = await response.json();
            showApplicantDetails(applicant);
        } else {
            showToast('Error loading applicant details', 'error');
        }
    } catch (error) {
        showToast('Error loading applicant details', 'error');
    }
}

function showApplicantDetails(applicant) {
    const modal = document.getElementById('applicant-details-modal');
    if (!modal) {
        createApplicantDetailsModal();
    }

    const modalContent = document.getElementById('applicant-details-content');
    modalContent.innerHTML = `
        <h2>${applicant.name}</h2>
        <div class="details-section">
            <p><strong>Email:</strong> ${applicant.email}</p>
            <p><strong>Phone:</strong> ${applicant.phone || 'Not provided'}</p>
            <p><strong>Total Experience:</strong> ${applicant.total_experience ? applicant.total_experience + ' years' : 'Not specified'}</p>
        </div>

        ${applicant.skills && applicant.skills.length > 0 ? `
        <div class="details-section">
            <h3>Skills</h3>
            <div class="skills-list">
                ${applicant.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
            </div>
        </div>
        ` : ''}

        ${applicant.education && applicant.education.length > 0 ? `
        <div class="details-section">
            <h3>Education</h3>
            <ul>
                ${applicant.education.map(edu => `<li>${edu}</li>`).join('')}
            </ul>
        </div>
        ` : ''}

        ${applicant.experience && applicant.experience.length > 0 ? `
        <div class="details-section">
            <h3>Experience</h3>
            <ul>
                ${applicant.experience.map(exp => `<li>${exp}</li>`).join('')}
            </ul>
        </div>
        ` : ''}

        ${applicant.company_names && applicant.company_names.length > 0 ? `
        <div class="details-section">
            <h3>Previous Companies</h3>
            <div class="company-tags">
                ${applicant.company_names.map(company => `<span class="company-tag">${company}</span>`).join('')}
            </div>
        </div>
        ` : ''}

        ${applicant.designations && applicant.designations.length > 0 ? `
        <div class="details-section">
            <h3>Designations</h3>
            <div class="designation-tags">
                ${applicant.designations.map(designation => `<span class="designation-tag">${designation}</span>`).join('')}
            </div>
        </div>
        ` : ''}

        ${applicant.degrees && applicant.degrees.length > 0 ? `
        <div class="details-section">
            <h3>Degrees</h3>
            <div class="degree-tags">
                ${applicant.degrees.map(degree => `<span class="degree-tag">${degree}</span>`).join('')}
            </div>
        </div>
        ` : ''}

        ${applicant.college_names && applicant.college_names.length > 0 ? `
        <div class="details-section">
            <h3>Colleges</h3>
            <div class="college-tags">
                ${applicant.college_names.map(college => `<span class="college-tag">${college}</span>`).join('')}
            </div>
        </div>
        ` : ''}
    `;

    document.getElementById('applicant-details-modal').style.display = 'block';
}

function createApplicantDetailsModal() {
    const modal = document.createElement('div');
    modal.id = 'applicant-details-modal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="hideApplicantDetails()">&times;</span>
            <div id="applicant-details-content"></div>
        </div>
    `;
    document.body.appendChild(modal);
}

function hideApplicantDetails() {
    document.getElementById('applicant-details-modal').style.display = 'none';
}

async function deleteApplicant(applicantId) {
    if (confirm('Are you sure you want to delete this applicant? This action cannot be undone.')) {
        try {
            const response = await apiRequest(`/applicants/${applicantId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                showToast('Applicant deleted successfully!', 'success');
                loadApplicants();
            } else {
                const error = await response.json();
                showToast(error.detail || 'Error deleting applicant', 'error');
            }
        } catch (error) {
            showToast('Network error. Please try again.', 'error');
        }
    }
}

function showApplicantForm() {
    document.getElementById('applicant-form').style.display = 'block';
}

function hideApplicantForm() {
    document.getElementById('applicant-form').style.display = 'none';
}

async function saveApplicant(event) {
    event.preventDefault();

    const formData = new FormData();
    const name = document.getElementById('applicant-name').value;
    const email = document.getElementById('applicant-email').value;
    const resumeFile = document.getElementById('applicant-resume').files[0];

    if (!name || !email || !resumeFile) {
        showToast('Please fill in all required fields', 'error');
        return;
    }

    formData.append('name', name);
    formData.append('email', email);
    formData.append('resume', resumeFile);

    try {
        const response = await fetch(`${API_BASE}/applicants/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`
            },
            body: formData
        });

        if (response.ok) {
            showToast('Applicant profile created successfully!', 'success');
            hideApplicantForm();
            loadApplicants();
            document.getElementById('applicant-form').querySelector('form').reset();
        } else {
            const error = await response.json();
            console.error('Applicant creation error:', error);

            // Handle different error formats
            let errorMessage = 'Error creating applicant profile';
            if (error.detail) {
                if (typeof error.detail === 'string') {
                    errorMessage = error.detail;
                } else if (Array.isArray(error.detail)) {
                    errorMessage = error.detail.map(err => err.msg || err.message || JSON.stringify(err)).join(', ');
                } else {
                    errorMessage = JSON.stringify(error.detail);
                }
            }

            showToast(errorMessage, 'error');
        }
    } catch (error) {
        console.error('Network error during applicant creation:', error);
        showToast('Network error. Please try again.', 'error');
    }
}

// Interviews Functions
async function loadInterviews() {
    try {
        const response = await apiRequest('/interviews/');
        const interviews = await response.json();

        const interviewsList = document.getElementById('interviews-list');
        interviewsList.innerHTML = '';

        for (const interview of interviews) {
            // Load applicant and job details
            const [applicantResponse, jobResponse] = await Promise.all([
                apiRequest(`/applicants/${interview.applicant_id}`),
                apiRequest(`/jobs/${interview.position_id}`)
            ]);

            const applicant = applicantResponse.ok ? await applicantResponse.json() : null;
            const job = jobResponse.ok ? await jobResponse.json() : null;

            const interviewCard = document.createElement('div');
            interviewCard.className = 'card';
            interviewCard.innerHTML = `
                <h3>Interview - ${job ? job.title : 'Unknown Position'}</h3>
                <p><strong>Applicant:</strong> ${applicant ? applicant.name : 'Unknown'}</p>
                <p><strong>Date & Time:</strong> ${new Date(interview.date_time).toLocaleString()}</p>
                <p><strong>Status:</strong> <span class="status-badge status-${interview.status}">${interview.status}</span></p>
                <div class="card-actions">
                    ${currentUser.role === 'company' ? `
                        <button class="btn btn-primary" onclick="updateInterviewStatus(${interview.id})">Update Status</button>
                    ` : ''}
                </div>
            `;
            interviewsList.appendChild(interviewCard);
        }
    } catch (error) {
        showToast('Error loading interviews', 'error');
    }
}

async function updateInterviewStatus(interviewId) {
    // Create a custom modal for status selection
    const statusModal = document.createElement('div');
    statusModal.className = 'modal';
    statusModal.style.display = 'block';
    statusModal.innerHTML = `
        <div class="modal-content" style="max-width: 400px;">
            <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
            <h2>Update Interview Status</h2>
            <form id="status-update-form">
                <div class="form-group">
                    <label for="status-select">Select New Status:</label>
                    <select id="status-select" required>
                        <option value="">Choose status...</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="rescheduled">Rescheduled</option>
                    </select>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Update Status</button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(statusModal);

    // Handle form submission
    document.getElementById('status-update-form').onsubmit = async function(event) {
        event.preventDefault();
        const newStatus = document.getElementById('status-select').value;

        if (!newStatus) {
            showToast('Please select a status', 'error');
            return;
        }

        try {
            const response = await apiRequest(`/interviews/${interviewId}`, {
                method: 'PUT',
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                showToast('Interview status updated successfully!', 'success');
                statusModal.remove();
                loadInterviews();
            } else {
                const error = await response.json();
                showToast(error.detail || 'Error updating interview status', 'error');
            }
        } catch (error) {
            showToast('Network error. Please try again.', 'error');
        }
    };
}

function showInterviewForm() {
    loadApplicantsForSelect('interview-applicant');
    loadJobsForSelect('interview-position');
    document.getElementById('interview-form').style.display = 'block';
}

function hideInterviewForm() {
    document.getElementById('interview-form').style.display = 'none';
}

async function saveInterview(event) {
    event.preventDefault();

    const interviewData = {
        applicant_id: parseInt(document.getElementById('interview-applicant').value),
        position_id: parseInt(document.getElementById('interview-position').value),
        date_time: document.getElementById('interview-datetime').value
    };

    try {
        const response = await apiRequest('/interviews/', {
            method: 'POST',
            body: JSON.stringify(interviewData)
        });

        if (response.ok) {
            showToast('Interview scheduled successfully!', 'success');
            hideInterviewForm();
            loadInterviews();
        } else {
            const error = await response.json();
            showToast(error.detail || 'Error scheduling interview', 'error');
        }
    } catch (error) {
        showToast('Network error. Please try again.', 'error');
    }
}

// Offers Functions
async function loadOffers() {
    try {
        const response = await apiRequest('/offers/');
        if (response.ok) {
            const offers = await response.json();
            displayOffers(offers);
        } else {
            showToast('Error loading offers', 'error');
        }
    } catch (error) {
        showToast('Error loading offers', 'error');
    }
}

function displayOffers(offers) {
    const offersList = document.getElementById('offers-list');
    offersList.innerHTML = '';

    if (offers.length === 0) {
        offersList.innerHTML = '<p>No offer letters generated yet. Use the Generate Offer button to create offer letters.</p>';
        return;
    }

    offers.forEach(async (offer) => {
        // Get applicant and job details
        try {
            const [applicantResponse, jobResponse] = await Promise.all([
                apiRequest(`/applicants/${offer.applicant_id}`),
                apiRequest(`/jobs/${offer.position_id}`)
            ]);

            const applicant = applicantResponse.ok ? await applicantResponse.json() : null;
            const job = jobResponse.ok ? await jobResponse.json() : null;

            const offerCard = document.createElement('div');
            offerCard.className = 'card';
            offerCard.innerHTML = `
                <h3>Offer Letter #${offer.id}</h3>
                <p><strong>Candidate:</strong> ${applicant ? applicant.name : 'Unknown'}</p>
                <p><strong>Position:</strong> ${job ? job.title : 'Unknown Position'}</p>
                <p><strong>Salary:</strong> $${offer.salary || 'Not specified'}</p>
                <p><strong>Start Date:</strong> ${offer.start_date || 'Not specified'}</p>
                <p><strong>Generated:</strong> ${new Date(offer.created_at).toLocaleDateString()}</p>
                <div class="card-actions">
                    <button class="btn btn-primary" onclick="downloadOffer(${offer.id})">Download PDF</button>
                    ${currentUser.role === 'company' ? `
                        <button class="btn btn-danger" onclick="deleteOffer(${offer.id})">Delete</button>
                    ` : ''}
                </div>
            `;
            offersList.appendChild(offerCard);
        } catch (error) {
            console.error('Error loading offer details:', error);
        }
    });
}

function showOfferForm() {
    loadApplicantsForSelect('offer-applicant');
    loadJobsForSelect('offer-position');
    document.getElementById('offer-form').style.display = 'block';
}

function hideOfferForm() {
    document.getElementById('offer-form').style.display = 'none';
}

async function saveOffer(event) {
    event.preventDefault();

    const offerData = {
        applicant_id: parseInt(document.getElementById('offer-applicant').value),
        position_id: parseInt(document.getElementById('offer-position').value),
        salary: parseFloat(document.getElementById('offer-salary').value),
        start_date: document.getElementById('offer-start-date').value
    };

    try {
        const response = await apiRequest('/offers/', {
            method: 'POST',
            body: JSON.stringify(offerData)
        });

        if (response.ok) {
            const offer = await response.json();
            showToast('Offer letter generated successfully!', 'success');
            hideOfferForm();
            loadOffers(); // Refresh the offers list
            
            // Automatically download the generated offer letter
            downloadOffer(offer.id);
        } else {
            const error = await response.json();
            showToast(error.detail || 'Error generating offer letter', 'error');
        }
    } catch (error) {
        showToast('Network error. Please try again.', 'error');
    }
}

async function downloadOffer(offerId) {
    try {
        const response = await apiRequest(`/offers/${offerId}`);
        
        if (response.ok) {
            // Get the filename from response headers or use a default
            const contentDisposition = response.headers.get('content-disposition');
            let filename = `offer_letter_${offerId}.pdf`;
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="(.+)"/);
                if (filenameMatch) {
                    filename = filenameMatch[1];
                }
            }
            
            // Convert response to blob and download
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            showToast('Offer letter downloaded successfully!', 'success');
        } else {
            const error = await response.json();
            showToast(error.detail || 'Error downloading offer letter', 'error');
        }
    } catch (error) {
        showToast('Error downloading offer letter', 'error');
    }
}

async function deleteOffer(offerId) {
    if (confirm('Are you sure you want to delete this offer letter? This action cannot be undone.')) {
        try {
            const response = await apiRequest(`/offers/${offerId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                showToast('Offer letter deleted successfully!', 'success');
                loadOffers();
            } else {
                const error = await response.json();
                showToast(error.detail || 'Error deleting offer letter', 'error');
            }
        } catch (error) {
            showToast('Network error. Please try again.', 'error');
        }
    }
}

// Matching Functions
async function loadMatching() {
    // Initial load - will be populated when user clicks "Find Matches"
    document.getElementById('matches-list').innerHTML = '<p>Click "Find Matches" to see job-applicant matching results.</p>';
    document.getElementById('candidate-matches-list').innerHTML = '<p>Select a candidate and click "Find Matching Jobs" to see results.</p>';
    
    // Load candidates for the dropdown
    await loadCandidatesForMatching();
}

function showMatchingTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.matching-tab').forEach(tab => {
        tab.classList.remove('active');
    });

    // Remove active class from all tab buttons
    document.querySelectorAll('.matching-tabs .tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected tab and activate button
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    // Find and activate the correct tab button
    const tabButtons = document.querySelectorAll('.matching-tabs .tab-btn');
    tabButtons.forEach(btn => {
        if ((tabName === 'job-to-candidate' && btn.textContent.includes('Jobs to Candidates')) ||
            (tabName === 'candidate-to-job' && btn.textContent.includes('Candidates to Jobs'))) {
            btn.classList.add('active');
        }
    });
}

async function loadCandidatesForMatching() {
    try {
        const response = await apiRequest('/applicants/');
        if (response.ok) {
            const applicants = await response.json();
            const select = document.getElementById('candidate-select');
            select.innerHTML = '<option value="">Choose a candidate...</option>';

            applicants.forEach(applicant => {
                const option = document.createElement('option');
                option.value = applicant.id;
                option.textContent = `${applicant.name} (${applicant.email})`;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading candidates:', error);
    }
}

function updateMatchThreshold(value) {
    document.getElementById('threshold-value').textContent = value + '%';
}

function updateCandidateMatchThreshold(value) {
    document.getElementById('candidate-threshold-value').textContent = value + '%';
}

async function findJobsForCandidate() {
    const candidateId = document.getElementById('candidate-select').value;
    const threshold = document.getElementById('candidate-match-threshold').value;

    if (!candidateId) {
        showToast('Please select a candidate first', 'error');
        return;
    }

    try {
        const response = await apiRequest(`/matching/applicants/${candidateId}/matches?min_match_percentage=${threshold}`);
        
        if (!response.ok) {
            showToast('Error finding job matches for candidate', 'error');
            return;
        }

        const data = await response.json();
        const matchesList = document.getElementById('candidate-matches-list');
        matchesList.innerHTML = '';

        if (data.job_matches.length === 0) {
            matchesList.innerHTML = '<p>No matching jobs found for this candidate with the current threshold.</p>';
            return;
        }

        // Create header
        const header = document.createElement('div');
        header.className = 'matches-header';
        header.innerHTML = `
            <h3>Matching Jobs for ${data.applicant_name}</h3>
            <p>Found ${data.total_matches} job matches</p>
        `;
        matchesList.appendChild(header);

        // Display job matches
        data.job_matches.forEach(match => {
            const matchItem = document.createElement('div');
            matchItem.className = 'match-item';
            matchItem.innerHTML = `
                <div class="match-header">
                    <h3>${match.title}</h3>
                    <div class="match-percentage">${match.match_percentage}%</div>
                </div>
                <p><strong>Description:</strong> ${match.description}</p>
                <div class="matched-skills">
                    <strong>Matched Skills:</strong>
                    ${match.matched_skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                </div>
            `;
            matchesList.appendChild(matchItem);
        });

        showToast(`Found ${data.total_matches} job matches!`, 'success');
    } catch (error) {
        showToast('Error finding job matches for candidate', 'error');
    }
}

async function findMatches() {
    const threshold = document.getElementById('match-threshold').value;

    try {
        // Get all jobs and applicants first
        const [jobsResponse, applicantsResponse] = await Promise.all([
            apiRequest('/jobs/'),
            apiRequest('/applicants/')
        ]);

        if (!jobsResponse.ok || !applicantsResponse.ok) {
            showToast('Error loading data for matching', 'error');
            return;
        }

        const jobs = await jobsResponse.json();
        const applicants = await applicantsResponse.json();

        const matchesList = document.getElementById('matches-list');
        matchesList.innerHTML = '';

        let allMatches = [];

        // For each job, find matching candidates
        for (const job of jobs) {
            try {
                const response = await apiRequest(`/matching/jobs/${job.id}/candidates?min_match_percentage=${threshold}`);
                if (response.ok) {
                    const jobMatches = await response.json();
                    jobMatches.candidates.forEach(candidate => {
                        allMatches.push({
                            job_title: job.title,
                            job_id: job.id,
                            applicant_name: candidate.name,
                            applicant_email: candidate.email,
                            applicant_id: candidate.applicant_id,
                            match_percentage: candidate.match_percentage,
                            matched_skills: candidate.matched_skills
                        });
                    });
                }
            } catch (error) {
                console.error(`Error getting matches for job ${job.id}:`, error);
            }
        }

        if (allMatches.length === 0) {
            matchesList.innerHTML = '<p>No matches found with the current threshold.</p>';
            return;
        }

        // Sort by match percentage
        allMatches.sort((a, b) => b.match_percentage - a.match_percentage);

        allMatches.forEach(match => {
            const matchItem = document.createElement('div');
            matchItem.className = 'match-item';
            matchItem.innerHTML = `
                <div class="match-header">
                    <h3>${match.applicant_name} ↔ ${match.job_title}</h3>
                    <div class="match-percentage">${match.match_percentage}%</div>
                </div>
                <p><strong>Applicant:</strong> ${match.applicant_name} (${match.applicant_email})</p>
                <p><strong>Position:</strong> ${match.job_title}</p>
                <div class="matched-skills">
                    ${match.matched_skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                </div>
            `;
            matchesList.appendChild(matchItem);
        });

        showToast(`Found ${allMatches.length} matches!`, 'success');
    } catch (error) {
        showToast('Error finding matches', 'error');
    }
}

// Helper Functions
async function loadApplicantsForSelect(selectId) {
    try {
        const response = await apiRequest('/applicants/');
        const applicants = await response.json();

        const select = document.getElementById(selectId);
        select.innerHTML = '<option value="">Select Applicant</option>';

        applicants.forEach(applicant => {
            const option = document.createElement('option');
            option.value = applicant.id;
            option.textContent = `${applicant.name} (${applicant.email})`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading applicants for select:', error);
    }
}

async function loadJobsForSelect(selectId) {
    try {
        const response = await apiRequest('/jobs/');
        const jobs = await response.json();

        const select = document.getElementById(selectId);
        select.innerHTML = '<option value="">Select Position</option>';

        jobs.forEach(job => {
            const option = document.createElement('option');
            option.value = job.id;
            option.textContent = job.title;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading jobs for select:', error);
    }
}

function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;

    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 5000);
}

// Close modals when clicking outside
window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}