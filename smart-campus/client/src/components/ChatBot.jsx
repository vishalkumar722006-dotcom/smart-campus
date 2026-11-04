import React, { useState, useRef, useEffect } from 'react';

const FAQ = {
  'Booking': [
    { q: 'How do I book a resource?', steps: ['Go to the Resources page from the navigation menu.', 'Browse available resources and click "Book Now" on your preferred resource.', 'Fill in the booking form: select date, start time, end time, purpose, and number of users.', 'Click "Review Booking" to preview your details.', 'Click "Confirm Booking" to submit.', 'You will receive a confirmation email. Booking status will be "Pending" until approved by admin.'] },
    { q: 'How do I cancel a booking?', steps: ['Go to "My Bookings" from the navigation menu.', 'Find the booking you want to cancel.', 'Click the "Cancel" button next to the booking.', 'Confirm the cancellation in the popup.', 'You will receive a cancellation email notification.'] },
    { q: 'Why is my booking still pending?', steps: ['Bookings require admin approval before they are confirmed.', 'Admin reviews all pending bookings regularly.', 'You will receive an email once your booking is approved or rejected.', 'You can check the status anytime in "My Bookings" page.', 'If pending for too long, contact the campus admin.'] },
    { q: 'Can I book the same resource twice on the same day?', steps: ['Yes, but only if the time slots do not overlap.', 'The system automatically checks for time conflicts.', 'If a conflict is detected, you will see a warning message.', 'Choose a different time slot to proceed with the booking.'] },
    { q: 'What happens after my booking is approved?', steps: ['You will receive an approval email with booking details.', 'Your booking status changes from "Pending" to "Approved".', 'Visit the resource at your booked date and time.', 'After use, admin may mark it as "Completed".'] },
    { q: 'Can I book a resource for past dates?', steps: ['No, the system does not allow booking for past dates.', 'You can only book from today\'s date onwards.', 'The date picker will automatically disable past dates.'] },
  ],
  'Resources': [
    { q: 'What resources are available?', steps: ['The campus offers various resources including:', '• Classrooms and Lecture Halls', '• Seminar and Conference Rooms', '• Sports Facilities (Courts, Grounds)', '• Computer and Science Labs', '• Auditoriums and Event Spaces', '• Libraries and Study Rooms', 'Visit the Resources page to see all available options.'] },
    { q: 'Why is a resource showing "Unavailable"?', steps: ['A resource is marked Unavailable when it is under maintenance or temporarily closed.', 'Admin can mark any resource as unavailable at any time.', 'You cannot book an unavailable resource.', 'Check back later or choose a different resource.', 'Contact admin if you urgently need that resource.'] },
    { q: 'How do I check resource capacity?', steps: ['Each resource card shows the capacity on the Resources page.', 'Look for the 👥 icon followed by the capacity number.', 'You can also see capacity in the booking form.', 'Make sure your number of users does not exceed the capacity.'] },
    { q: 'Can I see resource details before booking?', steps: ['Yes! Click "View Details" on any resource card.', 'The detail page shows: name, type, location, capacity, availability, and description.', 'You can also book directly from the detail page.', 'Images and additional information are displayed there.'] },
  ],
  'Account': [
    { q: 'How do I register an account?', steps: ['Click "Create Account" on the login page.', 'Fill in your name, university email, student/faculty ID, and password.', 'Password must be at least 8 characters with uppercase, lowercase, and number.', 'Click "Create Account" to submit.', 'Check your email for a 6-digit OTP verification code.', 'Enter the OTP to verify and activate your account.', 'You can now login with your credentials.'] },
    { q: 'I forgot my password. What do I do?', steps: ['Click "Forgot Password?" on the login page.', 'Enter your registered university email address.', 'Check your email for a password reset OTP.', 'Enter the OTP on the verification page.', 'Create a new password (min 8 chars, uppercase, lowercase, number).', 'Login with your new password.'] },
    { q: 'My OTP is not arriving. What should I do?', steps: ['Check your Spam or Junk folder in your email.', 'Make sure you entered the correct email address.', 'Wait 60 seconds before requesting a new OTP.', 'Click "Resend OTP" button on the verification page.', 'Make sure your university email is active.', 'Contact admin if the problem persists.'] },
    { q: 'How do I update my profile?', steps: ['Click on your name or avatar in the navigation bar.', 'Select "Profile" from the dropdown menu.', 'Update your name, phone number, or department.', 'Click "Save Changes" to update your profile.'] },
    { q: 'Can I change my email address?', steps: ['Currently, email address cannot be changed after registration.', 'Your university email is used as your unique identifier.', 'If you need to change email, contact the campus admin.', 'Admin can update your account details manually.'] },
  ],
  'Admin': [
    { q: 'How does admin approve bookings?', steps: ['Admin logs in with admin credentials.', 'Admin receives a secure OTP to their registered email.', 'After login, admin goes to Admin Dashboard → Bookings tab.', 'Pending bookings are listed with Approve and Reject buttons.', 'Admin clicks "✓ Approve" or "✕ Reject" for each booking.', 'User receives an email notification about the decision.'] },
    { q: 'How do I contact the admin?', steps: ['Visit the Contact or About page for admin contact details.', 'You can email the campus administration directly.', 'For urgent matters, visit the campus administration office.', 'Admin email: admin@smartcampus.com'] },
    { q: 'Who can access the Admin Dashboard?', steps: ['Only users with the "admin" role can access the Admin Dashboard.', 'Admin login requires an additional OTP verification for security.', 'Students and faculty cannot access admin features.', 'Admin can manage users, resources, and all bookings.'] },
  ],
  'General': [
    { q: 'What is Smart Campus Portal?', steps: ['Smart Campus Portal is a resource booking system for university students and faculty.', 'It allows you to book campus resources like classrooms, labs, sports facilities, and more.', 'All bookings are managed digitally — no need to visit the admin office.', 'You receive email notifications for all booking updates.', 'The system ensures fair and transparent resource allocation.'] },
    { q: 'Is my data secure?', steps: ['Yes! All passwords are encrypted and never stored in plain text.', 'OTP verification adds an extra layer of security.', 'JWT tokens are used for secure authentication.', 'Your personal data is never shared with third parties.', 'All API communications are secured.'] },
    { q: 'What browsers are supported?', steps: ['Smart Campus Portal works on all modern browsers:', '• Google Chrome (recommended)', '• Mozilla Firefox', '• Microsoft Edge', '• Safari', 'Make sure your browser is up to date for the best experience.'] },
  ]
};

const ICONS = { 'Booking': '📅', 'Resources': '🏛️', 'Account': '👤', 'Admin': '⚙️', 'General': 'ℹ️' };

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState(null);
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hi! 👋 Welcome to Smart Campus Help. Choose a category to get started!', type: 'categories' }
  ]);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const selectCategory = (cat) => {
    setCategory(cat);
    setMessages(prev => [
      ...prev,
      { from: 'user', text: `${ICONS[cat]} ${cat}` },
      { from: 'bot', text: `Here are common questions about ${cat}:`, type: 'questions', cat }
    ]);
  };

  const selectQuestion = (q) => {
    setMessages(prev => [
      ...prev,
      { from: 'user', text: q.q },
      { from: 'bot', text: q.steps[0], stepIndex: 0, steps: q.steps },
    ]);
  };

  const nextStep = (steps, stepIndex) => {
    const next = stepIndex + 1;
    if (next < steps.length) {
      setMessages(prev => [
        ...prev,
        { from: 'bot', text: steps[next], stepIndex: next, steps }
      ]);
    } else {
      setMessages(prev => [
        ...prev,
        { from: 'bot', text: '✅ Done! Need help with something else?', type: 'done' }
      ]);
    }
  };

  const reset = () => {
    setCategory(null);
    setMessages([{ from: 'bot', text: 'Hi! 👋 Welcome to Smart Campus Help. Choose a category to get started!', type: 'categories' }]);
  };

  const isLast = (i) => i === messages.length - 1;

  return (
    <>
      <button onClick={() => setOpen(o => !o)} style={{
        position:'fixed', bottom:24, right:24, zIndex:9999,
        width:56, height:56, borderRadius:'50%', border:'none', cursor:'pointer',
        background:'linear-gradient(135deg,#4f46e5,#7c3aed)',
        boxShadow:'0 4px 20px rgba(79,70,229,0.4)',
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:24, color:'#fff'
      }}>
        {open ? '✕' : '💬'}
      </button>

      {open && (
        <div style={{
          position:'fixed', bottom:90, right:24, zIndex:9998,
          width:360, height:520, borderRadius:20,
          background:'#fff', boxShadow:'0 20px 60px rgba(0,0,0,0.15)',
          display:'flex', flexDirection:'column', overflow:'hidden',
          border:'1px solid #e5e7eb'
        }}>
          {/* Header */}
          <div style={{ background:'linear-gradient(135deg,#4f46e5,#7c3aed)', padding:'14px 18px', color:'#fff', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:36, height:36, borderRadius:'50%', background:'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>🤖</div>
              <div>
                <div style={{ fontWeight:700, fontSize:15 }}>Campus Assistant</div>
                <div style={{ fontSize:11, opacity:0.8 }}>● Online</div>
              </div>
            </div>
            <button onClick={reset} style={{ background:'rgba(255,255,255,0.15)', border:'none', color:'#fff', borderRadius:8, padding:'4px 10px', cursor:'pointer', fontSize:12, fontWeight:600 }}>
              🔄 Reset
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex:1, overflowY:'auto', padding:'14px', display:'flex', flexDirection:'column', gap:10 }}>
            {messages.map((m, i) => (
              <div key={i}>
                {m.from === 'bot' ? (
                  <div style={{ display:'flex', gap:8, alignItems:'flex-start' }}>
                    <div style={{ width:28, height:28, borderRadius:'50%', background:'linear-gradient(135deg,#4f46e5,#7c3aed)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, flexShrink:0 }}>🤖</div>
                    <div style={{ maxWidth:'85%' }}>
                      <div style={{ background:'#f3f4f6', borderRadius:'0 12px 12px 12px', padding:'10px 14px', fontSize:13, lineHeight:1.6, color:'#1f2937' }}>
                        {m.text}
                        {m.steps && m.stepIndex < m.steps.length - 1 && isLast(i) && (
                          <button onClick={() => nextStep(m.steps, m.stepIndex)}
                            style={{ display:'block', marginTop:8, padding:'5px 14px', borderRadius:8, border:'none', cursor:'pointer', background:'#4f46e5', color:'#fff', fontSize:12, fontWeight:700 }}>
                            Next → ({m.stepIndex + 1}/{m.steps.length})
                          </button>
                        )}
                        {m.steps && m.stepIndex === m.steps.length - 1 && (
                          <div style={{ marginTop:4, fontSize:11, color:'#6b7280' }}>Step {m.stepIndex + 1}/{m.steps.length} ✓</div>
                        )}
                      </div>

                      {m.type === 'categories' && isLast(i) && (
                        <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginTop:8 }}>
                          {Object.keys(FAQ).map(cat => (
                            <button key={cat} onClick={() => selectCategory(cat)}
                              style={{ padding:'6px 12px', borderRadius:20, border:'1px solid #e5e7eb', background:'#fff', cursor:'pointer', fontSize:12, fontWeight:600, color:'#4f46e5' }}>
                              {ICONS[cat]} {cat}
                            </button>
                          ))}
                        </div>
                      )}

                      {m.type === 'questions' && isLast(i) && (
                        <div style={{ display:'flex', flexDirection:'column', gap:6, marginTop:8 }}>
                          {FAQ[m.cat].map((q, qi) => (
                            <button key={qi} onClick={() => selectQuestion(q)}
                              style={{ padding:'8px 12px', borderRadius:10, border:'1px solid #e5e7eb', background:'#fff', cursor:'pointer', fontSize:12, fontWeight:600, color:'#1f2937', textAlign:'left' }}>
                              ❓ {q.q}
                            </button>
                          ))}
                          <button onClick={() => { setCategory(null); setMessages(prev => [...prev, { from: 'bot', text: 'Choose a category:', type: 'categories' }]); }}
                            style={{ padding:'6px 12px', borderRadius:10, border:'1px solid #e5e7eb', background:'#f9fafb', cursor:'pointer', fontSize:12, color:'#6b7280' }}>
                            ← Back
                          </button>
                        </div>
                      )}

                      {m.type === 'done' && isLast(i) && (
                        <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginTop:8 }}>
                          {Object.keys(FAQ).map(cat => (
                            <button key={cat} onClick={() => selectCategory(cat)}
                              style={{ padding:'5px 10px', borderRadius:20, border:'1px solid #e5e7eb', background:'#fff', cursor:'pointer', fontSize:11, fontWeight:600, color:'#4f46e5' }}>
                              {ICONS[cat]} {cat}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div style={{ display:'flex', justifyContent:'flex-end' }}>
                    <div style={{ background:'linear-gradient(135deg,#4f46e5,#7c3aed)', color:'#fff', borderRadius:'12px 0 12px 12px', padding:'10px 14px', fontSize:13, maxWidth:'80%' }}>
                      {m.text}
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        </div>
      )}
    </>
  );
}