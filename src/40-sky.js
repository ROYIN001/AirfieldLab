// ───────────────────────── Sky dome, clouds, image-based light, sun and exposure ─────────────────────────

const SKY_GLSL = /* glsl */`
uniform vec3 uSun; uniform float uSunE; uniform float uSunFade; uniform vec3 uBR; uniform vec3 uBM;
uniform float uMieG; uniform float uGain; uniform float uDay; uniform float uTw;
vec3 skyRad(vec3 d) {
  float zen = acos(max(0.0, d.y));
  float inv = 1.0 / (cos(zen) + 0.15 * pow(93.885 - degrees(zen), -1.253));
  float sR = 8400.0 * inv, sM = 1250.0 * inv;
  float ct = dot(d, uSun);
  float rx = ct * 0.5 + 0.5;
  float rP = 0.05968310365946075 * (1.0 + rx * rx);
  float g2 = uMieG * uMieG;
  float mP = 0.07957747154594767 * ((1.0 - g2) / pow(1.0 - 2.0 * uMieG * ct + g2, 1.5));
  vec3 Fex = exp(-(uBR * sR + uBM * sM));
  vec3 ratio = (uBR * rP + uBM * mP) / (uBR + uBM);
  vec3 Lin = pow(max(uSunE * ratio * (1.0 - Fex), vec3(0.0)), vec3(1.5));
  float hm = clamp(pow(1.0 - uSun.y, 5.0), 0.0, 1.0);
  Lin *= 1.0 + (pow(max(uSunE * ratio * Fex, vec3(0.0)), vec3(0.5)) - 1.0) * hm;
  vec3 tex = (Lin + 0.1 * Fex) * 0.04 + vec3(0.0, 0.0003, 0.00075);
  return pow(tex, vec3(1.0 / (1.2 + 1.2 * uSunFade))) * uGain;
}
vec3 skyFull(vec3 dIn) {
  vec3 d = normalize(vec3(dIn.x, max(dIn.y, 0.0), dIn.z));
  vec3 L = skyRad(d);
  float dy = max(d.y, 0.0);
  float hb = 1.0 + 2.5 * pow(1.0 - dy, 3.0);
  vec2 sh = normalize(uSun.xz + 1e-5), dh = normalize(d.xz + 1e-5);
  float ca = max(0.0, dot(sh, dh));
  float glow = pow(ca, 4.0) * exp(-dy * 7.0);
  return L * uDay + (vec3(0.010, 0.022, 0.060) * hb + vec3(0.22, 0.09, 0.03) * glow) * uTw + vec3(0.0016, 0.0024, 0.0048);
}`;

function makeSkyMaterial(capture) {
  return new THREE.ShaderMaterial({
    name: capture ? 'sky-capture' : 'sky',
    side: THREE.BackSide, depthWrite: false, depthTest: false, fog: false, toneMapped: true,
    uniforms: Object.assign({
      uSun: { value: new THREE.Vector3(0, 1, 0) }, uSunE: { value: 1000 }, uSunFade: { value: 1 },
      uBR: { value: new THREE.Vector3() }, uBM: { value: new THREE.Vector3() }, uMieG: { value: SKY.mieG }, uGain: { value: SKY.gain },
      uDay: { value: 1 }, uTw: { value: 0 }, uSunCol: { value: new THREE.Vector3(1, 1, 1) }, uStars: { value: 0 },
      uGround: { value: new THREE.Vector3(0.02, 0.02, 0.015) }, uCityDir: { value: new THREE.Vector2(0, 1) },
    }, SU),
    vertexShader: /* glsl */`varying vec3 vDir; void main(){ vDir = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: GLSL_PRELUDE + SKY_GLSL + /* glsl */`
      varying vec3 vDir; uniform vec3 uSunCol; uniform float uStars; uniform vec3 uGround; uniform vec2 uCityDir;
      void main() {
        vec3 d = normalize(vDir);
        vec3 col;
        ${capture ? `
        if (d.y >= 0.0) col = skyFull(d); else col = mix(hzFogColor(d), uGround, smoothstep(0.0, -0.2, d.y));
        ` : `
        col = skyFull(d);
        col = mix(col, hzFogColor(d), exp(-max(d.y, 0.0) * 22.0) * 0.5);
        if (d.y < 0.0) col = hzFogColor(d);
        float cs = dot(d, uSun);
        float vis = smoothstep(-0.012, 0.004, d.y);
        col += uSunCol * (smoothstep(0.99997, 0.999985, cs) * 24.0 + pow(max(cs, 0.0), 900.0) * 0.5 + pow(max(cs, 0.0), 40.0) * 0.025) * vis;
        if (uStars > 0.01 && d.y > 0.0) {
          vec3 sd = d * 430.0; vec3 cell = floor(sd);
          ivec2 hc = ivec2(int(cell.x) + int(cell.z) * 977, int(cell.y) * 131 + int(cell.z) * 31);
          float h = hash2i(hc);
          if (h > 0.9955) {
            vec3 sp = cell + 0.5;
            float dist = length(sd - sp);
            float tw = 0.75 + 0.25 * sin(uTime * (2.0 + h * 9.0) + h * 400.0);
            float mag = pow(hash2i(hc + 17), 3.0);
            col += vec3(0.9, 0.95, 1.0) * smoothstep(0.42, 0.0, dist) * uStars * (0.02 + 0.25 * mag) * tw * smoothstep(0.0, 0.12, d.y);
          }
        }
        vec2 dh = normalize(d.xz + 1e-5);
        col += uNight * vec3(0.009, 0.005, 0.002) * pow(max(dot(dh, uCityDir), 0.0), 3.0) * exp(-max(d.y, 0.0) * 18.0);
        `}
        gl_FragColor = vec4(col, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
}

function makeCloudMaterial() {
  return new THREE.ShaderMaterial({
    name: 'clouds', transparent: true, depthWrite: false, side: THREE.DoubleSide, fog: false,
    uniforms: Object.assign({ uSunCol: { value: new THREE.Vector3(1, 1, 1) }, uAmb: { value: new THREE.Vector3(0.3, 0.35, 0.4) } }, SU),
    vertexShader: /* glsl */`varying vec3 vWP; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vWP = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: GLSL_PRELUDE + /* glsl */`
      varying vec3 vWP; uniform vec3 uSunCol; uniform vec3 uAmb;
      void main() {
        float d = cloudDensity(vWP.xz);
        if (d < 0.01) discard;
        vec2 toSun = uSunW.xz / max(uSunW.y, 0.12);
        float ds = cloudDensity(vWP.xz + toSun * 220.0);
        float ds2 = cloudDensity(vWP.xz + toSun * 520.0);
        float light = mix(1.0, 0.35, ds * 0.6 + ds2 * 0.4);
        vec3 v = vWP - cameraPosition; float dist = length(v);
        float below = step(vWP.y, cameraPosition.y) ;
        vec3 col = uSunCol * light * 0.26 * smoothstep(-0.05, 0.25, uSunW.y) + uAmb * mix(1.0, 0.6, d) + uNight * vec3(0.004, 0.0025, 0.0012);
        float fog = 1.0 - exp(-pow(dist / 24000.0, 2.0));
        col = mix(col, hzFogColor(normalize(v)), fog);
        float a = clamp(d * 1.25, 0.0, 0.96) * (1.0 - smoothstep(24000.0, 37000.0, dist));
        gl_FragColor = vec4(col, a);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
}

class SkySystem {
  constructor(renderer, scene) {
    this.renderer = renderer; this.scene = scene;
    const geo = new THREE.SphereGeometry(1, 64, 32);
    this.mat = makeSkyMaterial(false);
    this.dome = new THREE.Mesh(geo, this.mat);
    this.dome.scale.setScalar(4000); this.dome.renderOrder = -100; this.dome.frustumCulled = false;
    scene.add(this.dome);
    this.capMat = makeSkyMaterial(true);
    this.capScene = new THREE.Scene();
    const cap = new THREE.Mesh(geo, this.capMat); cap.scale.setScalar(100); this.capScene.add(cap);
    this.pmrem = new THREE.PMREMGenerator(renderer);
    this.envRT = null; this.envKey = '';
    this.cloudMat = makeCloudMaterial();
    this.clouds = new THREE.Mesh(new THREE.PlaneGeometry(76000, 76000), this.cloudMat);
    this.clouds.rotation.x = -Math.PI / 2; this.clouds.renderOrder = 10; this.clouds.frustumCulled = false;
    scene.add(this.clouds);
    this.sun = new THREE.DirectionalLight(0xffffff, 1);
    this.sun.castShadow = true;
    this.sun.shadow.bias = -0.00035; this.sun.shadow.normalBias = 0.04; this.sun.shadow.radius = 2.5;
    scene.add(this.sun, this.sun.target);
    this.state = { sunDir: [0, 1, 0], sunCol: [1, 1, 1], ambUp: [0.3, 0.3, 0.3], exposure: 0.6, night: 0, day: 1, lightsOn: 0 };
    this.cloudCover = 0.3; this.visibility = 20000;
    scene.fog = new THREE.FogExp2(0x9aa8b8, 1e-4);
  }

  setTime(date) {
    const sp = sunPosition(date, FIELD.lat, FIELD.lon);
    this.sunPos = sp;
    const sun = dirFromElevAz(sp.elev, sp.az);
    this.setSunDir(sun);
  }

  setSunDir(sun) {
    const st = this.state;
    st.sunDir = sun;
    const zc = clamp(sun[1], -1, 1);
    const sunE = 1000 * Math.max(0, 1 - Math.exp(-((1.6110731556870734 - Math.acos(zc)) / 1.5)));
    const sunfade = 1 - clamp(1 - Math.exp(zc), 0, 1);
    const rc = SKY.ray - (1 - sunfade);
    const c = 0.2 * SKY.turb * 10e-18;
    const bR = TOTAL_RAYLEIGH.map((v) => v * rc), bM = MIE_CONST.map((v) => 0.434 * c * v * SKY.mie);
    const day = smoothstep(-0.12, -0.035, sun[1]);
    const tw = smoothstep(-0.30, -0.02, sun[1]) * (1 - smoothstep(-0.02, 0.07, sun[1]));
    const sc = sunColor(sun[1]);
    st.sunCol = sc;
    st.night = 1 - smoothstep(-0.11, 0.07, sun[1]);
    st.day = smoothstep(0.0, 0.17, sun[1]);
    for (const m of [this.mat, this.capMat]) {
      const u = m.uniforms;
      u.uSun.value.set(sun[0], sun[1], sun[2]); u.uSunE.value = sunE; u.uSunFade.value = sunfade;
      u.uBR.value.set(...bR); u.uBM.value.set(...bM); u.uDay.value = day; u.uTw.value = tw;
      u.uSunCol.value.set(sc[0], sc[1], sc[2]);
      u.uStars.value = smoothstep(-0.05, -0.2, sun[1]);
    }
    SU.uSunW.value.set(sun[0], sun[1], sun[2]);
    SU.uNight.value = st.night;
    // irradiance and exposure
    const amb = skyIrradianceUp(sun);
    st.ambUp = amb;
    const L = lum(sc) * Math.max(sun[1], 0) + lum(amb);
    st.exposure = clamp(0.5 * Math.pow(15 / Math.max(L, 1e-5), 0.36), 0.3, 7);
    const gAlb = [0.09, 0.11, 0.06];
    const gr = [0, 1, 2].map((k) => gAlb[k] * (sc[k] * Math.max(sun[1], 0) + amb[k]) / Math.PI);
    this.capMat.uniforms.uGround.value.set(...gr);
    // sun light
    const m = Math.max(sc[0], sc[1], sc[2], 1e-6);
    this.sun.color.setRGB(sc[0] / m, sc[1] / m, sc[2] / m);
    this.sun.intensity = sun[1] > -0.02 ? m : 0;
    // clouds
    this.cloudMat.uniforms.uSunCol.value.set(...sc);
    this.cloudMat.uniforms.uAmb.value.set(amb[0] / Math.PI * 0.95, amb[1] / Math.PI * 0.95, amb[2] / Math.PI * 0.95);
    this.updateFogPalette();
    this.envDirty = true;
  }

  updateFogPalette() {
    const sun = this.state.sunDir, e = 2.0 * DEG;
    const city = 200 * DEG, night = this.state.night;
    for (let i = 0; i < 16; i++) {
      const az = i * 22.5 * DEG;
      const d = [Math.sin(az) * Math.cos(e), Math.sin(e), -Math.cos(az) * Math.cos(e)];
      const L = skyFull(d, sun);
      const cg = Math.pow(Math.max(0, Math.cos(az - city)), 3) * night;
      SU.uFogHz.value[i].set(L[0] * 0.97 + 0.008 * cg, L[1] * 0.98 + 0.0045 * cg, L[2] + 0.0018 * cg);
    }
    this.mat.uniforms.uCityDir.value.set(Math.sin(city), -Math.cos(city));
  }

  setWeather({ cloud = this.cloudCover, visibility = this.visibility } = {}) {
    this.cloudCover = cloud; this.visibility = visibility;
    SU.uCloud.value.x = cloud;
    this.scene.fog.density = 1.98 / visibility;
    this.envDirty = true;
  }

  updateEnv(force = false) {
    const now = performance.now();
    if (!force && (!this.envDirty || now - (this.lastEnv || 0) < 250)) return;
    this.envDirty = false; this.lastEnv = now;
    const rt = this.pmrem.fromScene(this.capScene, 0, 0.1, 1000);
    if (this.envRT) this.envRT.dispose();
    this.envRT = rt; this.scene.environment = rt.texture;
  }

  // per frame: follow the camera, place the shadow box around the focus, drift the clouds
  frame(camera, focus, shadowR, t) {
    this.dome.position.copy(camera.position);
    this.clouds.position.set(camera.position.x, SU.uCloudAlt.value, camera.position.z);
    SU.uCloud.value.z = t * 4.2; SU.uCloud.value.w = t * 1.3;
    const s = this.state.sunDir, L = this.sun;
    const sh = L.shadow, cam = sh.camera;
    const R = shadowR;
    if (cam.right !== R) { cam.left = -R; cam.right = R; cam.top = R; cam.bottom = -R; cam.near = 1; cam.far = 8000; cam.updateProjectionMatrix(); }
    // snap the focus to shadow texels to keep edges steady while the camera moves
    const sunV = new THREE.Vector3(s[0], Math.max(s[1], 0.05), s[2]).normalize();
    const up = Math.abs(sunV.y) > 0.99 ? new THREE.Vector3(0, 0, 1) : new THREE.Vector3(0, 1, 0);
    const xA = new THREE.Vector3().crossVectors(up, sunV).normalize(), yA = new THREE.Vector3().crossVectors(sunV, xA);
    const tex = (2 * R) / sh.mapSize.x;
    const fx = Math.round(focus.dot(xA) / tex) * tex, fy = Math.round(focus.dot(yA) / tex) * tex, fz = focus.dot(sunV);
    const f = new THREE.Vector3().addScaledVector(xA, fx).addScaledVector(yA, fy).addScaledVector(sunV, fz);
    L.target.position.copy(f); L.position.copy(f).addScaledVector(sunV, 4000);
    L.target.updateMatrixWorld();
  }
}
