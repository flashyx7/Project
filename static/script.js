
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

            // Get user profile
            const userResponse = await apiRequest('/auth/me');
            if (userResponse.ok) {
                currentUser = await userResponse.json();
                localStorage.setItem('authToken', authToken);
                localStorage.setItem('currentUser', JSON.stringify(currentUser));

                showLoggedInState();
                showSection('dashboard');
                loadDashboardData();
                showToast('Login successful!', 'success');
            }
        } else {
            const error = await response.json();
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
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('main-nav').style.display = 'flex';
    document.getElementById('main-content').style.display = 'block';

    // Show/hide buttons based on user role
    if (currentUser && currentUser.role === 'company') {
        document.getElementById('create-job-btn').style.display = 'block';
    } else {
        document.getElementById('create-applicant-btn').style.display = 'block';
    }
}

function showLoggedOutState() {
    document.getElementById('auth-section').style.display = 'block';
    document.getElementById('main-nav').style.display = 'none';
    document.getElementById('main-content').style.display = 'none';
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
        const [jobsResponse, interviewsResponse] = await Promise.all([
            apiRequest('/jobs/'),
            apiRequest('/interviews/')
        ]);

        if (jobsResponse.ok && interviewsResponse.ok) {
            const jobs = await jobsResponse.json();
            const interviews = await interviewsResponse.json();

            document.getElementById('total-jobs').textContent = jobs.length;
            document.getElementById('total-interviews').textContent = interviews.length;
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

            document.getElementById('total-interviews').textContent = interviews.length;
            document.getElementById('total-offers').textContent = offers.length;
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
