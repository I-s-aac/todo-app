// animation.js
export function animateCut(element, onComplete) {
    const rect = element.getBoundingClientRect();
    const halfHeight = rect.height / 2;

    // Create two halves
    const topHalf = document.createElement('div');
    const bottomHalf = document.createElement('div');
    function disableScroll(event) {
        event.preventDefault();
    }
    window.addEventListener('wheel', disableScroll, { passive: false });
    window.addEventListener('touchmove', disableScroll, { passive: false });

    // Style the halves
    topHalf.style.transition = "transform 1s linear";
    topHalf.style.position = 'fixed';
    topHalf.style.borderBottom = "3px solid white";
    topHalf.style.marginBottom = "5px";
    topHalf.style.top = `${rect.top}px`;
    topHalf.style.left = `${rect.left}px`;
    topHalf.style.willChange = "transform";
    topHalf.style.width = `${rect.width}px`;
    topHalf.style.height = `${halfHeight}px`;
    topHalf.style.backgroundColor = getComputedStyle(element).backgroundColor;
    topHalf.style.zIndex = '999'; // Ensure it's above other elements

    bottomHalf.style.position = 'fixed';
    bottomHalf.style.top = `${rect.top + halfHeight}px`;
    bottomHalf.style.left = `${rect.left}px`;
    bottomHalf.style.transition = "transform 1s linear";
    bottomHalf.style.borderTop = "3px solid white";
    bottomHalf.style.marginTop = "5px";
    bottomHalf.style.willChange = "transform";
    bottomHalf.style.width = `${rect.width}px`;
    bottomHalf.style.height = `${halfHeight}px`;
    bottomHalf.style.backgroundColor = getComputedStyle(element).backgroundColor;
    bottomHalf.style.zIndex = '999'; // Ensure it's above other elements

    // Append halves to the body
    document.body.appendChild(topHalf);
    document.body.appendChild(bottomHalf);


    // Step 1: Visually cut the element
    element.classList.add('drag-placeholder');

    // Step 2: Animate the halves falling with gravity
    setTimeout(() => {
        
        
        // Function to simulate falling and rotation
        const animateHalf = (half) => {
            
            let positionX = 0;
            let positionY = 0;
            let yv = 0;
            let xv = 0;
            
            const gravity = (Math.random() * 3) + 10; // Gravity effect
            const jumpForce = Math.random() * 300;
            let angle = Math.random() * 360;

            xv = jumpForce * Math.cos(angle);
            yv = jumpForce * Math.sin(angle);

            // Set interval for physics simulation
            const interval = setInterval(() => {
                // Update position based on velocity
                positionY += yv;
                positionX += xv;
                yv += gravity; // Simulate gravity
                xv -= xv / 5;
                angle += xv > 0 ? xv * 5 : xv * -5;

                // Move the half
                half.style.transform = `translate(${positionX}px, ${positionY}px) rotate(${angle}deg)`;
                // Check if the half has fallen below the viewport
                if (positionY > (window.innerHeight * 15)) {
                    clearInterval(interval);
                    half.remove(); // Remove half after falling off screen
                }
            }, 16); // ~60fps
        };

        animateHalf(topHalf);
        animateHalf(bottomHalf);

        // Cleanup the original element
        setTimeout(() => {
            element.classList.remove('drag-placeholder');
            element.remove(); // Remove the original element
            window.removeEventListener('wheel', disableScroll, { passive: false });
            window.removeEventListener('touchmove', disableScroll, { passive: false });

            // Call the onComplete function if provided
            if (onComplete) {
                onComplete();
            }
        }, 500); // Match this to the duration of the falling animation
    }, 200); // delay before animation go brr
}
