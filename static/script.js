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
function showAuthTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));

    document.querySelector(`[onclick="showAuthTab('${tab}')"]`).classList.add('active');
    document.getElementById(`${tab}-form`).classList.add('active');
}

async function login(event) {
    event.preventDefault();

    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            authToken = data.access_token;
            currentUser = data.user;

            localStorage.setItem('authToken', authToken);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));

            showToast('Login successful!', 'success');
            showLoggedInState();
            showSection('dashboard');
            loadDashboardData();
        } else {
            showToast(data.detail || 'Login failed', 'error');
        }
    } catch (error) {
        showToast('Network error. Please try again.', 'error');
    }
}

async function register(event) {
    event.preventDefault();

    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;
    const role = document.getElementById('register-role').value;

    try {
        const response = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password, role })
        });

        const data = await response.json();

        if (response.ok) {
            showToast('Registration successful! Please login.', 'success');
            showAuthTab('login');
        } else {
            showToast(data.detail || 'Registration failed', 'error');
        }
    } catch (error) {
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
    document.getElementById('auth-link').style.display = 'none';
    document.getElementById('dashboard-link').style.display = 'block';
    document.getElementById('logout-link').style.display = 'block';

    if (currentUser.role === 'company') {
        document.getElementById('jobs-link').style.display = 'block';
        document.getElementById('applicants-link').style.display = 'block';
        document.getElementById('interviews-link').style.display = 'block';
        document.getElementById('offers-link').style.display = 'block';
        document.getElementById('matching-link').style.display = 'block';

        document.getElementById('create-job-btn').style.display = 'block';
        document.getElementById('create-interview-btn').style.display = 'block';
        document.getElementById('create-offer-btn').style.display = 'block';
    } else {
        document.getElementById('jobs-link').style.display = 'block';
        document.getElementById('applicants-link').style.display = 'block';
        document.getElementById('interviews-link').style.display = 'block';
        document.getElementById('offers-link').style.display = 'block';
        document.getElementById('matching-link').style.display = 'block';

        document.getElementById('create-applicant-btn').style.display = 'block';
    }
}

function showLoggedOutState() {
    document.getElementById('auth-link').style.display = 'block';
    document.querySelectorAll('.nav-link:not(#auth-link)').forEach(link => {
        link.style.display = 'none';
    });
    document.querySelectorAll('[id$="-btn"]').forEach(btn => {
        btn.style.display = 'none';
    });
}

// Navigation Functions
function showSection(sectionName) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });

    document.getElementById(`${sectionName}-section`).classList.add('active');
    document.getElementById(`${sectionName}-link`).classList.add('active');

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
        // Load stats
        const [jobsResponse, applicantsResponse, interviewsResponse] = await Promise.all([
            apiRequest('/jobs/'),
            apiRequest('/applicants/'),
            apiRequest('/interviews/')
        ]);

        if (jobsResponse.ok) {
            const jobs = await jobsResponse.json();
            document.getElementById('jobs-count').textContent = jobs.length;
        }

        if (applicantsResponse.ok) {
            const applicants = await applicantsResponse.json();
            document.getElementById('applicants-count').textContent = applicants.length;
        }

        if (interviewsResponse.ok) {
            const interviews = await interviewsResponse.json();
            document.getElementById('interviews-count').textContent = interviews.length;
        }

        // Load recent activities (mock data for now)
        const activitiesList = document.getElementById('activities-list');
        activitiesList.innerHTML = `
            <div class="activity-item">
                <div>New applicant registered</div>
                <div class="activity-time">2 hours ago</div>
            </div>
            <div class="activity-item">
                <div>Interview scheduled</div>
                <div class="activity-time">4 hours ago</div>
            </div>
            <div class="activity-item">
                <div>Job position created</div>
                <div class="activity-time">1 day ago</div>
            </div>
        `;
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

// Jobs Functions
async function loadJobs() {
    try {
        const response = await apiRequest('/jobs/');
        const jobs = await response.json();

        const jobsList = document.getElementById('jobs-list');
        jobsList.innerHTML = '';

        jobs.forEach(job => {
            const jobCard = document.createElement('div');
            jobCard.className = 'card';
            jobCard.innerHTML = `
                <h3>${job.title}</h3>
                <p><strong>Description:</strong> ${job.description}</p>
                <p><strong>Skills:</strong> ${job.skills ? job.skills.join(', ') : 'N/A'}</p>
                <p><strong>Salary:</strong> ${job.salary ? '$' + job.salary.toLocaleString() : 'Not specified'}</p>
                <p><strong>Location:</strong> ${job.location || 'Not specified'}</p>
                <div class="card-actions">
                    ${currentUser.role === 'company' ? `
                        <button class="btn btn-primary" onclick="editJob(${job.id})">Edit</button>
                        <button class="btn btn-danger" onclick="deleteJob(${job.id})">Delete</button>
                    ` : ''}
                </div>
            `;
            jobsList.appendChild(jobCard);
        });
    } catch (error) {
        showToast('Error loading jobs', 'error');
    }
}

function showJobForm(jobId = null) {
    const modal = document.getElementById('job-form');
    const form = modal.querySelector('form');
    const title = document.getElementById('job-form-title');

    if (jobId) {
        title.textContent = 'Edit Job Position';
        // Load job data for editing
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

async function saveJob(event) {
    event.preventDefault();

    const jobId = document.getElementById('job-id').value;
    const jobData = {
        title: document.getElementById('job-title').value,
        description: document.getElementById('job-description').value,
        skills: document.getElementById('job-skills').value.split(',').map(s => s.trim()),
        salary: parseFloat(document.getElementById('job-salary').value) || null,
        location: document.getElementById('job-location').value || null
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

async function deleteJob(jobId) {
    if (!confirm('Are you sure you want to delete this job?')) return;

    try {
        const response = await apiRequest(`/jobs/${jobId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showToast('Job deleted successfully!', 'success');
            loadJobs();
        } else {
            const error = await response.json();
            showToast(error.detail || 'Error deleting job', 'error');
        }
    } catch (error) {
        showToast('Network error. Please try again.', 'error');
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
                </div>
            `;
            applicantsList.appendChild(applicantCard);
        });
    } catch (error) {
        showToast('Error loading applicants', 'error');
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
    formData.append('name', document.getElementById('applicant-name').value);
    formData.append('email', document.getElementById('applicant-email').value);
    formData.append('resume', document.getElementById('applicant-resume').files[0]);

    try {
        const response = await apiRequest('/applicants/', {
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
        } else {
            const error = await response.json();
            showToast(error.detail || 'Error creating applicant profile', 'error');
        }
    } catch (error) {
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
        const offers = await response.json();

        const offersList = document.getElementById('offers-list');
        offersList.innerHTML = '';

        // For now, show placeholder since offers endpoint might not return list
        offersList.innerHTML = '<p>Offers functionality implemented. Use the Generate Offer button to create offer letters.</p>';
    } catch (error) {
        showToast('Error loading offers', 'error');
    }
}

function showOfferForm() {
    loadApplicantsForSelect('offer-applicant');
    loadJobsForSelect('interview-position');
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

            // Download the generated offer letter
            window.open(`${API_BASE}/offers/${offer.id}`, '_blank');
        } else {
            const error = await response.json();
            showToast(error.detail || 'Error generating offer letter', 'error');
        }
    } catch (error) {
        showToast('Network error. Please try again.', 'error');
    }
}

// Matching Functions
async function loadMatching() {
    // Initial load - will be populated when user clicks "Find Matches"
    document.getElementById('matches-list').innerHTML = '<p>Click "Find Matches" to see job-applicant matching results.</p>';
}

function updateMatchThreshold(value) {
    document.getElementById('threshold-value').textContent = value + '%';
}

async function findMatches() {
    const threshold = document.getElementById('match-threshold').value;

    try {
        const response = await apiRequest(`/matching/matches?min_match_percentage=${threshold}`);
        const matches = await response.json();

        const matchesList = document.getElementById('matches-list');
        matchesList.innerHTML = '';

        if (matches.length === 0) {
            matchesList.innerHTML = '<p>No matches found with the current threshold.</p>';
            return;
        }

        matches.forEach(match => {
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

// API base URL
const API_BASE = '';

// Authentication functions
async function register() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;

    if (!username || !password || !role) {
        alert('Please fill in all fields');
        return;
    }

    try {
        const response = await fetch('/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password, role }),
        });

        const data = await response.json();

        if (response.ok) {
            alert('Registration successful! Please login.');
            showLogin();
        } else {
            alert(data.detail || 'Registration failed');
        }
    } catch (error) {
        console.error('Registration error:', error);
        alert('Network error. Please try again.');
    }
}

async function login() {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    if (!username || !password) {
        alert('Please fill in all fields');
        return;
    }

    try {
        const response = await fetch('/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.access_token);
            localStorage.setItem('user', JSON.stringify(data.user));
            showDashboard();
        } else {
            alert(data.detail || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Network error. Please try again.');
    }
}

// UI Navigation functions
function showLogin() {
    document.getElementById('authContainer').style.display = 'none';
    document.getElementById('loginContainer').style.display = 'block';
    document.getElementById('registerContainer').style.display = 'none';
    document.getElementById('dashboardContainer').style.display = 'none';
}

function showRegister() {
    document.getElementById('authContainer').style.display = 'none';
    document.getElementById('loginContainer').style.display = 'none';
    document.getElementById('registerContainer').style.display = 'block';
    document.getElementById('dashboardContainer').style.display = 'none';
}

function showDashboard() {
    document.getElementById('authContainer').style.display = 'none';
    document.getElementById('loginContainer').style.display = 'none';
    document.getElementById('registerContainer').style.display = 'none';
    document.getElementById('dashboardContainer').style.display = 'block';

    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        document.getElementById('welcomeMessage').textContent = `Welcome, ${user.username}!`;
        document.getElementById('userRole').textContent = `Role: ${user.role}`;
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    document.getElementById('authContainer').style.display = 'block';
    document.getElementById('loginContainer').style.display = 'none';
    document.getElementById('registerContainer').style.display = 'none';
    document.getElementById('dashboardContainer').style.display = 'none';
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
        showDashboard();
    } else {
        document.getElementById('authContainer').style.display = 'block';
    }
});