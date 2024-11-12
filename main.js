import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import GUI from 'lil-gui'
import gsap from 'gsap'
import { Sky } from 'three/addons/objects/Sky.js'
import fireworkVertexShader from './shaders/firework/vertex.glsl?raw'
import fireworkFragmentShader from './shaders/firework/fragment.glsl?raw'

/**
 * Base
 */
// Debug
const gui = new GUI({ width: 340 })

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Loaders
const textureLoader = new THREE.TextureLoader()

const textures = [
    textureLoader.load('./particles/1.png'),
    textureLoader.load('./particles/2.png'),  
    textureLoader.load('./particles/3.png'),
    textureLoader.load('./particles/4.png'),
    textureLoader.load('./particles/5.png'),
    textureLoader.load('./particles/6.png'),
    textureLoader.load('./particles/7.png'),
    textureLoader.load('./particles/8.png'),
]


/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
    pixelRatio: Math.min(window.devicePixelRatio, 2)
}

sizes.resolution = new THREE.Vector2(window.innerWidth, window.innerHeight)

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    sizes.pixelRatio = Math.min(window.devicePixelRatio, 2)

    // resolution
    sizes.resolution.set( sizes.width * sizes.pixelRatio, sizes.height * sizes.pixelRatio)


    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(sizes.pixelRatio)
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(25, sizes.width / sizes.height, 0.1, 100)
camera.position.set(1.5, 0, 6)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(sizes.pixelRatio)

/**
 * fire works
 * 
 */

function createFireWork(count, size, position, texture, radius, color){

    const positionArray = new Float32Array(count * 3)
    const sizesArray = new Float32Array(count)
    const timeMultiplyerArray = new Float32Array(count)



    for ( let i = 0; i < count; i++){

        const spherical = new THREE.Spherical(
            radius * 0.75 + Math.random() * .25,
            Math.random() * Math.PI,
            Math.random() * Math.PI * 2
        )
        
        const position = new THREE.Vector3()
        position.setFromSpherical(spherical)

        const i3 = i * 3;
        positionArray[i3] = position.x
        positionArray[i3 + 1] = position.y
        positionArray[i3 + 2] = position.z

        sizesArray[i] = Math.random()
        
        timeMultiplyerArray[i] = 1. + Math.random()

    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute( 'position', new THREE.Float32BufferAttribute(positionArray, 3))
    geometry.setAttribute( 'aSizes', new THREE.Float32BufferAttribute(sizesArray, 1))
    geometry.setAttribute( 'aTimeMultiplayer', new THREE.Float32BufferAttribute(timeMultiplyerArray, 1))

    


    texture.flipY = false

    const material = new THREE.ShaderMaterial({
        vertexShader: fireworkVertexShader,
        fragmentShader: fireworkFragmentShader,
        uniforms: {
            uSize: new THREE.Uniform(size),
            uResolution: new THREE.Uniform(sizes.resolution),
            uTexture: new THREE.Uniform(texture),
            uColor: new THREE.Uniform(color),
            uProgress: new THREE.Uniform(0)

        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    })

    // const material = new THREE.MeshBasicMaterial()
    const fireWork = new THREE.Points( geometry, material)
    
    fireWork.position.copy( position)
    scene.add(fireWork)

    function distroy(){
        scene.remove( fireWork)
        geometry.dispose()
        material.dispose()
    }

    gsap.to( material.uniforms.uProgress,
        { value: 1, duration: 3, ease: 'linear', onComplete: distroy}
    )



}

createRandomFireWork()

function createRandomFireWork(){
    const count = Math.round( 400 + Math.random() * 1000 )
    const positon = new THREE.Vector3(
        (Math.random() - .5) * 2,
        Math.random() ,
        (Math.random() - .5) * 2,
    )
    const size = 0.1 + Math.random() * .1
    const texture = textures[ Math.floor( Math.random() * textures.length )]
    const color = new THREE.Color().setHSL( Math.random(), 1, 0.7)
    const radius = .5 + Math.random()

    createFireWork( count, size, positon, texture, radius, color)

}


window.addEventListener( 'click', createRandomFireWork )


const sky = new Sky();
sky.scale.setScalar( 450000 );
scene.add( sky );

const sun = new THREE.Vector3();

/// GUI

const effectController = {
    turbidity: 10,
    rayleigh: 3,
    mieCoefficient: 0.005,
    mieDirectionalG: 0.7,
    elevation: 2,
    azimuth: 180,
    exposure: renderer.toneMappingExposure
};

function guiChanged() {

    const uniforms = sky.material.uniforms;
    uniforms[ 'turbidity' ].value = effectController.turbidity;
    uniforms[ 'rayleigh' ].value = effectController.rayleigh;
    uniforms[ 'mieCoefficient' ].value = effectController.mieCoefficient;
    uniforms[ 'mieDirectionalG' ].value = effectController.mieDirectionalG;

    const phi = THREE.MathUtils.degToRad( 90 - effectController.elevation );
    const theta = THREE.MathUtils.degToRad( effectController.azimuth );

    sun.setFromSphericalCoords( 1, phi, theta );

    uniforms[ 'sunPosition' ].value.copy( sun );

    renderer.toneMappingExposure = effectController.exposure;
    renderer.render( scene, camera );

}


gui.add( effectController, 'turbidity', 0.0, 20.0, 0.1 ).onChange( guiChanged );
gui.add( effectController, 'rayleigh', 0.0, 4, 0.001 ).onChange( guiChanged );
gui.add( effectController, 'mieCoefficient', 0.0, 0.1, 0.001 ).onChange( guiChanged );
gui.add( effectController, 'mieDirectionalG', 0.0, 1, 0.001 ).onChange( guiChanged );
gui.add( effectController, 'elevation', 0, 90, 0.1 ).onChange( guiChanged );
gui.add( effectController, 'azimuth', - 180, 180, 0.1 ).onChange( guiChanged );
gui.add( effectController, 'exposure', 0, 1, 0.0001 ).onChange( guiChanged );

guiChanged()


// plane

// const plane = new THREE.Mesh( 
//     new THREE.PlaneGeometry(),
//     new THREE.MeshBasicMaterial
// )

// scene.add( plane)

/**
 * Animate
 */
const tick = () =>
{
    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()