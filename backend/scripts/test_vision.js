// Test Vision API with sample image
// Usage: node test_vision.js

const fs = require('fs');
const https = require('https');

const WORKER_URL = 'https://wonder-link-backend.amhmeed31.workers.dev';

async function testVisionAPI() {
    console.log('🧪 Testing Vision API...\n');

    // Note: This test requires an actual image file
    // For real testing, download a sample image first:
    // Example: wget https://picsum.photos/500/500 -O test_image.jpg

    const imagePath = './test_image.jpg';

    if (!fs.existsSync(imagePath)) {
        console.log('❌ No test image found!');
        console.log('📥 Download a test image first:');
        console.log('   curl -o test_image.jpg "https://picsum.photos/500/500"');
        console.log('\nOr use any JPG/PNG image with 2 clear objects');
        process.exit(1);
    }

    // Read image as buffer
    const imageBuffer = fs.readFileSync(imagePath);

    // Create form data boundary
    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);

    // Build multipart form data
    const formData = [
        `--${boundary}`,
        'Content-Disposition: form-data; name="language"',
        '',
        'ar',
        `--${boundary}`,
        `Content-Disposition: form-data; name="image"; filename="test.jpg"`,
        'Content-Type: image/jpeg',
        '',
    ].join('\r\n') + '\r\n';

    const formDataBuffer = Buffer.concat([
        Buffer.from(formData, 'utf8'),
        imageBuffer,
        Buffer.from(`\r\n--${boundary}--\r\n`, 'utf8'),
    ]);

    // Make request
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': `multipart/form-data; boundary=${boundary}`,
            'Content-Length': formDataBuffer.length,
        },
    };

    return new Promise((resolve, reject) => {
        const req = https.request(WORKER_URL + '/api/generate-from-image', options, (res) => {
            let data = '';

            console.log(`📡 Status: ${res.statusCode}\n`);

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const result = JSON.parse(data);

                    if (res.statusCode === 200) {
                        console.log('✅ SUCCESS!\n');
                        console.log('📦 Puzzle Generated:');
                        console.log('  Start Word:', result.startWord);
                        console.log('  End Word:', result.endWord);
                        console.log('  Steps:', result.steps?.length || 0);
                        console.log('  Hint:', result.hint);
                        console.log('\n🔗 Full Chain:');
                        console.log('  ', result.startWord);
                        result.steps?.forEach((step, i) => {
                            console.log('  →', step.word, `(${step.options?.length || 0} options)`);
                        });
                        console.log('  →', result.endWord, '✨');
                        console.log('\n' + JSON.stringify(result, null, 2));
                    } else {
                        console.log('❌ ERROR:', data);
                    }

                    resolve(result);
                } catch (e) {
                    console.log('❌ Parse Error:', e.message);
                    console.log('Raw response:', data);
                    reject(e);
                }
            });
        });

        req.on('error', (e) => {
            console.log('❌ Request Error:', e.message);
            reject(e);
        });

        req.write(formDataBuffer);
        req.end();
    });
}

// Run test
testVisionAPI()
    .then(() => {
        console.log('\n✅ Test completed!');
        process.exit(0);
    })
    .catch((e) => {
        console.log('\n❌ Test failed:', e.message);
        process.exit(1);
    });
