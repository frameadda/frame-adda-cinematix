// script.js
document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Sticky Navbar & Shrink Effect ---
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // --- 2. Mobile Menu Toggle ---
    const menuToggle = document.getElementById('menuToggle');
    const mobileNav = document.getElementById('mobileNav');
    const mobileLinks = document.querySelectorAll('.mobile-nav-links a');

    if (menuToggle && mobileNav) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            mobileNav.classList.toggle('active');
            document.body.style.overflow = mobileNav.classList.contains('active') ? 'hidden' : '';
        });

        // Close menu when a link is clicked
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                mobileNav.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }

    // --- 3. Scroll Reveal Animations (Intersection Observer) ---
    const revealElements = document.querySelectorAll('.reveal');
    
    const revealCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                // Unobserve to keep them visible once animated in
                observer.unobserve(entry.target);
            }
        });
    };

    const revealOptions = {
        threshold: 0.15, // Trigger when 15% visible
        rootMargin: "0px 0px -50px 0px"
    };

    const revealObserver = new IntersectionObserver(revealCallback, revealOptions);
    
    revealElements.forEach(el => revealObserver.observe(el));

    // --- 3. 3D Studio Background (Three.js) ---
    const canvas = document.getElementById('canvas-bg');
    
    // Validate if Three.js is loaded
    if (typeof THREE !== 'undefined') {
        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x030403, 0.06); // Match var(--bg-dark)
        
        const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 2, 8);

        const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        // Studio Floor (Reflective/Glossy)
        const floorGeometry = new THREE.PlaneGeometry(100, 100);
        const floorMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x050505,
            roughness: 0.15,
            metalness: 0.8
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = -2;
        scene.add(floor);

        // Infinite Grid on floor
        const gridHelper = new THREE.GridHelper(100, 100, 0xA3BFA2, 0xA3BFA2);
        gridHelper.material.opacity = 0.05;
        gridHelper.material.transparent = true;
        gridHelper.position.y = -1.99;
        scene.add(gridHelper);
        
        // --- Darkroom Photo Lab 3D Background ---
        const elements = [];
        
        // Hanging Photos Geometry
        const photoGeo = new THREE.PlaneGeometry(0.8, 1.2);
        
        for (let i = 0; i < 35; i++) {
            // Mix of developing paper (white/grey) and some tinting with brand green #6F8F6B
            const material = new THREE.MeshStandardMaterial({
                color: Math.random() > 0.8 ? 0x6F8F6B : 0xe0e0e0,
                roughness: 0.6,
                metalness: 0.1,
                side: THREE.DoubleSide
            });
            const mesh = new THREE.Mesh(photoGeo, material);
            
            mesh.position.set(
                (Math.random() - 0.5) * 35,
                Math.random() * 6 + 1,
                (Math.random() - 0.5) * 25 - 5
            );
            
            // Hang them slightly tilted
            mesh.rotation.y = (Math.random() - 0.5) * 1.5;
            
            mesh.userData = {
                baseRotZ: (Math.random() - 0.5) * 0.1,
                baseRotX: (Math.random() - 0.5) * 0.1,
                offset: Math.random() * Math.PI * 2,
                swaySpeed: Math.random() * 0.5 + 0.5
            };
            
            // Add a thin wire going up to simulate hanging
            const lineMat = new THREE.LineBasicMaterial({color: 0x222222, transparent: true, opacity: 0.5});
            const points = [];
            points.push(new THREE.Vector3(0, 0.6, 0)); // Top edge of photo
            points.push(new THREE.Vector3(0, 10, 0));  // Up to the ceiling
            const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
            const wire = new THREE.Line(lineGeo, lineMat);
            mesh.add(wire);
            
            elements.push(mesh);
            scene.add(mesh);
        }
        
        // Darkroom Lighting (Red Safelight)
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.05);
        scene.add(ambientLight);
        
        // Deep Green Safelight Spotlight
        const safelight = new THREE.SpotLight(0x6F8F6B, 5);
        safelight.position.set(0, 15, 0);
        safelight.angle = Math.PI / 3;
        safelight.penumbra = 0.8;
        scene.add(safelight);
        
        // Subtle Brand Accent Lights so it's not purely red
        const pointLight1 = new THREE.PointLight(0xA3BFA2, 1, 20);
        pointLight1.position.set(10, 2, 5);
        scene.add(pointLight1);
        
        // Animation loop
        const clock = new THREE.Clock();
        
        function animate() {
            requestAnimationFrame(animate);
            const time = clock.getElapsedTime();
            
            // Cinematic photo swaying
            elements.forEach((el) => {
                // Gently sways from the top wire
                el.rotation.z = el.userData.baseRotZ + Math.sin(time * el.userData.swaySpeed + el.userData.offset) * 0.08;
                el.rotation.x = el.userData.baseRotX + Math.cos(time * el.userData.swaySpeed * 0.5 + el.userData.offset) * 0.04;
            });
            
            // Ambient pulsing of the accent lights
            pointLight1.intensity = 1 + Math.sin(time * 0.5) * 0.5;
            
            // Cinematic slow camera pan around the darkroom
            camera.position.x = Math.sin(time * 0.1) * 5;
            camera.position.z = Math.cos(time * 0.1) * 3 + 8;
            camera.lookAt(0, 2, 0);
            
            renderer.render(scene, camera);
        }
        animate();
        
        // Handle Window Resize
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
    } else {
        console.warn('Three.js failed to load. 3D background inactive.');
    }

    // --- 4. Interactive Logo Spin ---
    const logos = document.querySelectorAll('.brand-logo-anim');
    logos.forEach(logo => {
        logo.addEventListener('click', (e) => {
            // Toggle the fast spinning animation class
            logo.classList.toggle('spinning');
            
            // Prevent the link from jumping to the top of the page if they just wanted to spin it
            e.preventDefault();
        });
    });

    // --- 5. Accordion Gallery Logic ---
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const item = header.parentElement;
            const content = item.querySelector('.accordion-content');
            const isActive = item.classList.contains('active');
            
            // Optional: Close all other accordions
            document.querySelectorAll('.accordion-item').forEach(otherItem => {
                if(otherItem !== item) {
                    otherItem.classList.remove('active');
                    otherItem.querySelector('.accordion-content').style.maxHeight = null;
                }
            });
            
            // Toggle current
            if (!isActive) {
                item.classList.add('active');
                content.style.maxHeight = content.scrollHeight + "px";
            } else {
                item.classList.remove('active');
                content.style.maxHeight = null;
            }
        });
    });

    // --- 6. AI Chatbot Logic ---
    const chatBubble = document.getElementById('aiChatBubble');
    const chatTooltip = document.getElementById('aiChatTooltip');
    const chatWindow = document.getElementById('aiChatWindow');
    const chatClose = document.getElementById('aiChatClose');
    const chatMessages = document.getElementById('aiChatMessages');
    const chatForm = document.getElementById('aiChatForm');
    const chatInput = document.getElementById('aiChatInput');
    const quickReplies = document.querySelectorAll('.ai-chip');

    let chatOpened = false;

    if(chatBubble) {
        chatBubble.addEventListener('click', () => {
            if(chatTooltip) chatTooltip.classList.add('hide');
            chatWindow.classList.toggle('active');
            if(!chatOpened) {
                // First time open greeting
                setTimeout(() => {
                    appendMessage("bot", "Hello! Welcome to Frame Adda Cinematix 🎬. I am your AI Virtual Assistant. How can I help you today?");
                }, 400);
                chatOpened = true;
            }
        });
    }

    if(chatClose) {
        chatClose.addEventListener('click', () => {
            chatWindow.classList.remove('active');
        });
    }

    function appendMessage(sender, text) {
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('chat-msg', sender);
        msgDiv.innerHTML = text;
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function processBotResponse(query) {
        const q = query.toLowerCase();
        let response = "Thank you for reaching out! Please fill out our <a href='#contact' onclick='document.getElementById(\"aiChatClose\").click()' style='color:var(--accent); text-decoration:underline;'>Contact Form</a> and our expert team will contact you shortly.";
        
        if(q.includes('wedding')) {
            response = "For **Wedding Films** 💍, we offer highly aesthetic storytelling focusing on cinematic realism. Our packages start from traditional coverage to premium commercial-grade shoots. Let's discuss your dates via the contact form!";
        } else if(q.includes('commercial') || q.includes('shoot')) {
            response = "Looking to elevate your brand? 🎥 Our **Commercial Shoots** include dynamic lighting setups, drone aerials, and cinematic aesthetics. Please share your project details.";
        } else if(q.includes('location') || q.includes('where')) {
            response = "📍 **Locations:** We travel across India! We specialize in locations like Gujarat (Junagadh, Kutch, Bhavnath, Girnar) and Rajasthan (Udaipur, Jaipur).";
        } else if(q.includes('price') || q.includes('cost') || q.includes('package')) {
            response = "Every visual story is unique! Drop your details in the contact form, and we'll send over our detailed pricing brochure.";
        } else if(q.includes('hi') || q.includes('hello')) {
            response = "Hey! Ready to create some breathtaking visuals?";
        }

        // Simulate typing delay
        setTimeout(() => {
            appendMessage("bot", response);
        }, 700);
    }

    if(chatForm) {
        chatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const text = chatInput.value.trim();
            if(!text) return;
            
            appendMessage("user", text);
            chatInput.value = '';
            
            processBotResponse(text);
        });
    }

    quickReplies.forEach(btn => {
        btn.addEventListener('click', () => {
            const query = btn.getAttribute('data-query');
            appendMessage("user", btn.innerText);
            processBotResponse(query);
            // Hide replies after one is clicked to keep it clean
            const qContainer = document.getElementById('aiQuickReplies');
            if(qContainer) qContainer.style.display = 'none';
        });
    });



    // --- 7. Logo Camera Flash Animation ---
    const logoLinks = document.querySelectorAll('.logo-link, .brand-logo-anim');
    
    // Create the flash div once and append to body
    const flashDiv = document.createElement('div');
    flashDiv.classList.add('camera-flash');
    document.body.appendChild(flashDiv);

    logoLinks.forEach(logo => {
        logo.addEventListener('click', (e) => {
            // Only prevent default if it's an anchor tag to prevent hard jumps
            if(logo.tagName.toLowerCase() === 'a') {
                e.preventDefault();
            }

            // Remove class, trigger reflow, add class (restarts animation perfectly)
            flashDiv.classList.remove('flash-active');
            void flashDiv.offsetWidth; 
            flashDiv.classList.add('flash-active');

            // Scroll to top smoothly
            setTimeout(() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 100);
        });
    });

    // --- 8. Contact Form to Email Routing (Background AJAX) ---
    const submitBtn = document.querySelector('.submit-btn');
    if (submitBtn) {
        submitBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            
            const nameInput = document.getElementById('name');
            const emailInput = document.getElementById('email');
            const msgInput = document.getElementById('message');
            
            if(!nameInput || !emailInput || !msgInput) return;
            
            const name = nameInput.value.trim();
            const email = emailInput.value.trim();
            const message = msgInput.value.trim();

            if(!name || !email || !message) {
                alert('Please fill in all details (Name, Email, Message) before sending!');
                return;
            }

            // UI Feedback Loading
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = 'Sending... <i class="fa-solid fa-spinner fa-spin"></i>';
            submitBtn.style.pointerEvents = 'none';

            try {
                const response = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        access_key: "4c0e1301-678d-4fdf-896b-675588c0ebde",
                        subject: `New Inquiry from Frame Adda Website - ${name}`,
                        name: name,
                        email: email,
                        message: message,
                        from_name: "Frame Adda Website"
                    })
                });

                const result = await response.json();
                if(response.status == 200) {
                    // Success
                    submitBtn.innerHTML = 'Message Sent! <i class="fa-solid fa-check"></i>';
                    submitBtn.style.background = 'var(--secondary)';
                    
                    setTimeout(() => {
                        submitBtn.innerHTML = originalText;
                        submitBtn.style.pointerEvents = 'auto';
                        submitBtn.style.background = 'linear-gradient(135deg, var(--primary), var(--secondary))';
                        
                        nameInput.value = '';
                        emailInput.value = '';
                        msgInput.value = '';
                    }, 4000);
                } else {
                    submitBtn.innerHTML = 'Error! Try Again <i class="fa-solid fa-circle-xmark"></i>';
                    setTimeout(() => {
                        submitBtn.innerHTML = originalText;
                        submitBtn.style.pointerEvents = 'auto';
                    }, 3000);
                }
            } catch (error) {
                console.error(error);
                submitBtn.innerHTML = 'Error! Check Network';
                setTimeout(() => {
                    submitBtn.innerHTML = originalText;
                    submitBtn.style.pointerEvents = 'auto';
                }, 3000);
            }
        });
    }

});
