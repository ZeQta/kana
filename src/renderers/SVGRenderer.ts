export class SVGRenderer {
  async render(content: string, containerId: string, options: any = {}): Promise<HTMLDivElement> {
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Container ${containerId} not found`);
    }

    // Clear existing content
    container.innerHTML = '';

    // Create wrapper div
    const wrapper = document.createElement('div');
    wrapper.className = 'flex items-center justify-center p-4 bg-white rounded-lg border';
    wrapper.innerHTML = content;

    container.appendChild(wrapper);

    return wrapper;
  }
}